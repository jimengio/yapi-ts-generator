import queryString from "query-string";

type Id = string;

function switchPath(x: string) {
  location.hash = `#${x}`;
}

function qsStringify(queries: { [k: string]: any }) {
  return queryString.stringify(queries, { arrayFormat: "bracket" });
}

// generated

// Generated with router-code-generator@0.2.6-a1

export let genRouter = {
  $: {
    name: "home",
    raw: "",
    path: () => `/`,
    go: () => switchPath(`/`),
  },
};

export type GenRouterTypeMain = GenRouterTypeTree["$"];

export interface GenRouterTypeTree {
  $: {
    name: "home";
    params: {};
    query: {};
    next: null;
  };
}
