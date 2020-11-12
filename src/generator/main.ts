/**
 * 生成类型脚本的主入口, 大致几个步骤:
 * 1. 从 API 列表按照 tag 过滤出来想要生成的 API
 * 2. API path 是按照 `/` 隔成一段一段的, 按照这个信息, 构建一棵树
 * 3. 每个 API 生成对应的 API 代码, 比如 GET, useGet, dynamicGET, 整个模板
 * 4. 前面遍历过程会收集一下涉及到哪些类型, 统一生成出来, 并且 export
 *
 * 有个 preference 配置, 用来插入额外的配置,
 * 设计初考虑的是有些类型可能手写更方便, 那么就手写, 然后在生成的代码当中引用,
 * 那么就 preference 里边配置一下...
 *
 * 然后有个 configures 用来插入 api host.
 * 其中 mock api host 也是支持的, 但是就比较绕了
 */

import { Spec } from "swagger-schema-official";
import { IPathPreference, IPathPreferenceConfigs } from "../preference";
import { uniq, groupBy, toPairs, difference } from "lodash";

import { generateApiFunctions } from "./ajax-code";
import { getCodeOfAllInterfaces, clearInterfacesList } from "./interface-collector";
import { ISimpleDict } from "../types";

/** 平台的 API 包含 public API 和 internal API, 在 swagger 当中通过 tag 来区分 */

export type FuncTagFilter = (tags: string[]) => boolean;

// 检查代码是否正常

export let checkPaths = (apiPaths: string[], definedPaths: string[]) => {
  definedPaths.forEach((p) => {
    if (p.includes("/:")) {
      console.warn("Suspicious path with colon in variables:", p);
    }
  });
  let deltaPaths = difference(apiPaths, definedPaths);
  if (deltaPaths.length > 0) {
    console.warn("[WARN] Paths in preference not used:", deltaPaths);
  }
  deltaPaths = difference(definedPaths, apiPaths);
  if (deltaPaths.length > 0) {
    console.warn("[WARN] New paths not configured:", deltaPaths);
  }
};

// 基于路径分离出 chunks

export interface IPathInfo {
  original: string;
  chunks: string[];
}

// 基于 chunks 创建属性结构

export let buildTree = (rules: IPathInfo[]): IPathNode[] => {
  rules.forEach((rule) => {
    if (rule.chunks.length === 0) {
      console.error("Invalid rule with chunk length 0:", rule);
    }
  });

  let groupedRules = groupBy(rules, (rule) => rule.chunks[0]);

  return toPairs(groupedRules).map(([chunk, children]) => {
    let loweredChildren = children.map((child) => {
      return { ...child, chunks: child.chunks.slice(1) };
    });

    let theRule = loweredChildren.find((x) => x.chunks.length === 0);
    let childRules = loweredChildren.filter((x) => x.chunks.length > 0);
    return {
      chunk,
      original: theRule?.original || null,
      children: childRules.length > 0 ? buildTree(childRules) : undefined,
    };
  });
};

interface IPathNode {
  chunk: string;
  original: string;
  children: IPathNode[];
}

// 开始生成代码

export let generateCodeOfChildren = (
  swaggerSpec: Spec,
  pathNodes: IPathNode[],
  tagFilter: FuncTagFilter,
  pathPreferences: IPathPreferenceConfigs,
  definedQueryTypes: ISimpleDict
): string => {
  if (pathNodes == null || pathNodes.length === 0) {
    return "";
  }
  return pathNodes
    .map((node) => {
      let apiCode = "";
      let preference = pathPreferences[node.original];
      if (node.original != null) {
        apiCode = generateApiFunctions(node.original, swaggerSpec.paths[node.original], tagFilter, pathPreferences, definedQueryTypes);
      }

      return `
    ${node.chunk.replace(/\-/g, "_")}: {
      ${apiCode}
      ${generateCodeOfChildren(swaggerSpec, node.children, tagFilter, pathPreferences, definedQueryTypes)}
    },
    `.trim();
    })
    .join("\n");
};

export let generateApiTreeCode = (
  swaggerSpec: Spec,
  name: string,
  pathNodes: IPathNode[],
  tagFilter: FuncTagFilter,
  pathPreferences: IPathPreferenceConfigs,
  definedQueryTypes: ISimpleDict
) => {
  clearInterfacesList();
  let body = generateCodeOfChildren(swaggerSpec, pathNodes, tagFilter, pathPreferences, definedQueryTypes);
  return `
  export let ${name} = {
    ${body}
  }

  ${getCodeOfAllInterfaces()}

  `.trim();
};
