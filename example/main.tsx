import { pathPreferences } from "./preference";
import { configureSeedHosts } from "./configs";

// 应用启动之前修改 baseURL
configureSeedHosts(
  {
    apiHost: injectedApiHost,
    mockHost: "/mock",
    mockedPaths: [],
  },
  pathPreferences
);

import { JimuApisEventBus, EJimuApiEvent } from "@jimengio/api-base";

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
