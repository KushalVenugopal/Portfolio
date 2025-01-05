import Book from "../../Book";
import { atom, useAtom } from "jotai";

const TechMPictures = [
  "title",
  "sap",
  "servicenow",
  "power-bi",
  "postman",
  "empty",
];

const whichBook = "techm";

export const TechMPageAtom = atom(0);
export const TechMPages = [
  {
    front: "TechM-cover",
    back: TechMPictures[0],
  },
];

for (let i = 1; i < TechMPictures.length - 1; i += 2) {
  TechMPages.push({
    front: TechMPictures[i % TechMPictures.length],
    back: TechMPictures[(i + 1) % TechMPictures.length],
  });
}

TechMPages.push({
  front: TechMPictures[TechMPictures.length - 1],
  back: "old-book-cover-back",
});

export default function TechM() {
  return (
    <>
      <Book whichBook={whichBook} pages={TechMPages} pageAtom={TechMPageAtom} />
    </>
  );
}
