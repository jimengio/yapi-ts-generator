## YAPI ts generator

> 基于 YAPI 提供的 swagger JSON 生成 TypeScript 代码, 作为 React Hooks 使用.
> 参考 https://github.com/jimengio/table-form-example/ 当中的示例.

### Usages

![](https://img.shields.io/npm/v/@jimengio/yapi-ts-generator.svg?style=flat-square)

```yarn
yarn add @jimengio/yapi-ts-generator
```

当前项目包含生成代码(`src/generator/`)和运行时函数(`src/`). 参考 `example/gen.ts` 使用.

### 更新 API

- 从 YAPI 下载 "数据导出 > swaggerjson" 的数据, 替换 `example/swagger-api.json` 文件.
- 修改 `src/preference.ts` 当中路径的配置, 新增 API 要加上对应的项.
- 运行 `yarn gen` 生成新的 API, 留意下 log 中有没有明显问题.

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
