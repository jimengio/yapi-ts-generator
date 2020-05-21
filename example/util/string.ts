import { default as stringify } from "cson-parser/lib/stringify";

let replacer = (k: string, v: any) => {
  if (typeof v === "function") {
    return (v.toString() as string).split("=>")[0].replace(/\,\s*/g, ", ") + " =>";
  } else {
    return v;
  }
};

export let formatApi = (x: object) => {
  return stringify(x, replacer, 2);
};
