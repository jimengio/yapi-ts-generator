import { pathPreferences } from "./preference";
import { configureSeedHosts } from "./configs";

// 应用启动之前修改 baseURL
configureSeedHosts({
  apiHost: injectedApiHost,
  mockHost: "/mock",
  mockedPaths: [],
});

// 下面就是业务代码了, 用的时候替换掉就好

import { JimuApisEventBus, EJimuApiEvent } from "@jimengio/api-base";
import { genSeedApiTree } from "generated-api-tree";

declare const injectedApiHost: string;
declare const injectedInternalApiHost: string;

declare var module: any;

JimuApisEventBus.on(EJimuApiEvent.ErrorUnauthorized, () => {
  console.log("Need to login");
});

JimuApisEventBus.on(EJimuApiEvent.ErrorMessage, (error) => {
  console.error(error);
});

let fetchData = async () => {};
