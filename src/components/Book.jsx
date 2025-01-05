import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useHelper,
  useTexture,
  Float,
  Loader,
} from "@react-three/drei";
import { degToRad, MathUtils } from "three/src/math/MathUtils.js";
import { atom, useAtom } from "jotai";
import { useRef, useMemo, useState, useEffect } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { SRGBColorSpace } from "three";
import { Suspense } from "react";
import { easing } from "maath";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.75;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 2.63;
const PAGE_HEIGHT = 3;
const PAGE_DEPTH = 0.01;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const coverPageGeometry = new BoxGeometry(
  PAGE_WIDTH * 1.2,
  PAGE_HEIGHT * 1.2,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndeces = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndeces.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndeces, 4)
);

pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

function Page({
  whichBook,
  pages,
  pageAtom,
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  ...props
}) {
  pages.forEach((individualPage) => {
    useTexture.preload(`/textures/${individualPage.front}.jpg`);
    useTexture.preload(`/textures/${individualPage.back}.jpg`);
    useTexture.preload(`/textures/old-paper_roughness.jpg`);
  });

  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${whichBook}/${front}.jpg`,
    `/textures/${whichBook}/${back}.jpg`,
    ...(number === 0 || number === pages.length
      ? [`/textures/old-paper_roughness.jpg`]
      : []),
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 * 0.2) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 * 0.9) : 0;
      const turningIntensity = Math.sin(
        i * Math.PI * (1 / bones.length) * turningTime
      );

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = degToRad(Math.sin(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
        }
      }

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  return (
    <group {...props} ref={group} scale={1.3}>
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
}

function InsideBook({ whichBook, page, pages, pageAtom, ...props }) {
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props}>
      {[...pages].map((pageData, index) => (
        <Page
          whichBook={whichBook}
          key={index}
          page={delayedPage}
          number={index}
          {...pageData}
          pages={pages}
          pageAtom={pageAtom}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage == pages.length}
        />
      ))}
    </group>
  );
}

function Experience({ whichBook, page, pages, pageAtom }) {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <InsideBook
          whichBook={whichBook}
          page={page}
          pages={pages}
          pageAtom={pageAtom}
          rotation-y={-Math.PI / 2}
          rotation-x={-Math.PI / 8}
        />
      </Float>

      <OrbitControls enableZoom={true} />
      <Environment
        files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
        path="../textures/"
        background
        backgroundIntensity={4}
        backgroundRotation={[0, -Math.PI / 2, 0]}
      />
      {/* <axesHelper args={[3]} /> */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 5, 5]} color={"white"} intensity={0.1} />
    </>
  );
}

// Final Export
export default function Book({ whichBook, pages, pageAtom }) {
  const [page, setPage] = useAtom(pageAtom);
  return (
    <div className="book">
      <Canvas>
        <group position-y={0} className="the-experience">
          <Suspense fallback={null}>
            <Experience
              whichBook={whichBook}
              page={page}
              pages={pages}
              pageAtom={pageAtom}
            />
          </Suspense>
        </group>
      </Canvas>
      <Loader />
      <div className="page-buttons">
        {[...pages].map((_, index) => (
          <button onClick={() => setPage(index)}>
            {index === 0 ? "Cover" : `Page ${index}`}
          </button>
        ))}
        <button onClick={() => setPage(pages.length)}>Back Cover</button>
      </div>
    </div>
  );
}
