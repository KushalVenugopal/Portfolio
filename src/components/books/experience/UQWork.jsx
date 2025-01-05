import Book from "../../Book";
import { atom, useAtom } from "jotai";

const UQWorkPictures = [
  "title",
  "design-process",
  "prototyping",
  "stack",
  "brainstorming",
  "grading",
];

const whichBook = "uq_work";

export const UQWorkPageAtom = atom(0);
export const UQWorkPages = [
  {
    front: "UQ-work-cover",
    back: UQWorkPictures[0],
  },
];

for (let i = 1; i < UQWorkPictures.length - 1; i += 2) {
  UQWorkPages.push({
    front: UQWorkPictures[i % UQWorkPictures.length],
    back: UQWorkPictures[(i + 1) % UQWorkPictures.length],
  });
}

UQWorkPages.push({
  front: UQWorkPictures[UQWorkPictures.length - 1],
  back: "old-book-cover-back",
});

export default function UQWork() {
  return (
    <>
      <Book
        whichBook={whichBook}
        pages={UQWorkPages}
        pageAtom={UQWorkPageAtom}
      />
    </>
  );
}
