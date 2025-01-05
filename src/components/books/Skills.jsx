import Book from "../Book";
import { atom, useAtom } from "jotai";

const SkillsPictures = ["react", "three", "python", "workato", "php", "sql"];

const whichBook = "skills";

export const SkillsPageAtom = atom(0);
export const SkillsPages = [
  {
    front: "Skills-cover",
    back: SkillsPictures[0],
  },
];

for (let i = 1; i < SkillsPictures.length - 1; i += 2) {
  SkillsPages.push({
    front: SkillsPictures[i % SkillsPictures.length],
    back: SkillsPictures[(i + 1) % SkillsPictures.length],
  });
}

SkillsPages.push({
  front: SkillsPictures[SkillsPictures.length - 1],
  back: "old-book-cover-back",
});

export default function Skills() {
  return (
    <>
      <Book
        whichBook={whichBook}
        pages={SkillsPages}
        pageAtom={SkillsPageAtom}
      />
    </>
  );
}
