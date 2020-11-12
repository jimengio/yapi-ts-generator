import { IPathPreference } from "../src/preference";

/** 每次增减 API 的时候维护一下, 提供提示功能
 * 对象的配置功能比较高级, 一般用不到, 主要是手写类型的时候, 可以从配置插入, 提高准确性
 */
export let pathPreferences: { [k: string]: IPathPreference } = {
  "/user/info": {},
  "/user/me": {},
  "/user/accesses/{id}": {},
  "/users": {},
  "/users/{id}": {},
  "/tasks": {},
  "/tasks/{id}": {},
  "/tasks/dict": {},
  "/user-data": {},
};

// query 默认类型都是 string, 特殊的字段通过字典定义
export let definedQueryTypes = {
  id: "string",
  search: "string",
  keyword: "string",
  deleted: "boolean",
  limit: "number",
  offset: "number",
  showDeleted: "boolean",
  showInstalled: "boolean",
  departmentRecursive: "boolean",
};
