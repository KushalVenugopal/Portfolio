import Book from "../../Book";
import { atom, useAtom } from "jotai";

const UQPictures = [
  "title",
  "the-past-of-today",
  "pedal-more",
  "ml",
  "k-means",
  "memoria",
  "light-of-hope",
  "empty",
];

const whichBook = "uq-study";

export const UQPageAtom = atom(0);
export const UQPages = [
  {
    front: "UQ-cover",
    back: UQPictures[0],
  },
];

for (let i = 1; i < UQPictures.length - 1; i += 2) {
  UQPages.push({
    front: UQPictures[i % UQPictures.length],
    back: UQPictures[(i + 1) % UQPictures.length],
  });
}

UQPages.push({
  front: UQPictures[UQPictures.length - 1],
  back: "old-book-cover-back",
});

export default function UQ() {
  return (
    <>
      <Book whichBook={whichBook} pages={UQPages} pageAtom={UQPageAtom} />
      <a
        href="https://www.github.com/kushalvenugopal"
        target="_blank"
        className="github"
      >
        GitHub
      </a>
    </>
  );
}
