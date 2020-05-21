## Seed TypeScript APIs

> 平台 API, 复用业务模块. 文档 TODO .

> 示例 TODO

### Usages

```yarn
yarn add jimengio/yapi-ts-generator#0.0.3-a1 # 注意调整对应的版本或者分支名
```

```ts
import { genSeedApiTree, configureSeedHosts } from "@jimengio/yapi-ts-generator";

// 注意尽可能早调用
configureSeedHosts({
  apiHost: "/public",

  // 可选, 开发环境 mock 配置,
  mockHost: "/mock",
  mockedPaths: __DEV__ ? [] : null, // 注意不要把 mock 带到生产环境
});
```

### 更新 API

- 从 YAPI 下载 "数据导出 > swaggerjson" 的数据, 替换 `generator/swagger-api.json` 文件.
- 修改 `generator/preference.ts` 当中路径的配置, 新增 API 要加上对应的项.
- 运行 `yarn gen` 生成新的 API, 留意下 log 中有没有明显问题.
- merge 以后升级版本, 然后打 tag 发 release. (如有需要, PR 同时也可以发 alpha release).

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
