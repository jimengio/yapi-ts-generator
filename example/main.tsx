// 应用启动之前修改 baseURL
configureSeedHosts(
  {
    apiHost: injectedApiHost,
    mockHost: "/mock",
    mockedPaths: [],
  },
  {}
);

import ReactDOM from "react-dom";
import React from "react";

import "main.css";

import { parseRoutePath } from "@jimengio/ruled-router";

import { routerRules } from "./models/router-rules";

import Container from "./pages/container";
import { genSeedApiTree } from "./generated-api-tree";
import { GenRouterTypeMain } from "controller/generated-router";
import { configureSeedHosts } from "../src/configs";
import { JimuApisEventBus, EJimuApiEvent } from "@jimengio/api-base";

declare const injectedApiHost: string;
declare const injectedInternalApiHost: string;

const renderApp = () => {
  let routerTree = parseRoutePath(window.location.hash.slice(1), routerRules) as GenRouterTypeMain;

  ReactDOM.render(<Container router={routerTree} />, document.querySelector(".app"));
};

window.onload = renderApp;

window.addEventListener("hashchange", () => {
  renderApp();
});

declare var module: any;

if (module.hot) {
  module.hot.accept(["./pages/container"], () => {
    renderApp();
  });
}

JimuApisEventBus.on(EJimuApiEvent.ErrorUnauthorized, () => {
  console.log("Need to login");
});

JimuApisEventBus.on(EJimuApiEvent.ErrorMessage, (error) => {
  console.error(error);
});

let fetchData = async () => {};
