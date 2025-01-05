import Book from "../../Book";
import { atom, useAtom } from "jotai";

const NHCEPictures = [
  "title",
  "acdc",
  "mpmc",
  "vlsi",
  "acei",
  "edge-detection",
];

const whichBook = "nhce";

export const NHCEPageAtom = atom(0);
export const NHCEPages = [
  {
    front: "NHCE-cover",
    back: NHCEPictures[0],
  },
];

for (let i = 1; i < NHCEPictures.length - 1; i += 2) {
  NHCEPages.push({
    front: NHCEPictures[i % NHCEPictures.length],
    back: NHCEPictures[(i + 1) % NHCEPictures.length],
  });
}

NHCEPages.push({
  front: NHCEPictures[NHCEPictures.length - 1],
  back: "old-book-cover-back",
});

export default function NHCE() {
  return (
    <>
      <Book whichBook={whichBook} pages={NHCEPages} pageAtom={NHCEPageAtom} />
    </>
  );
}
