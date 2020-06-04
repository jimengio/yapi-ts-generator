import { IPathPreference } from "../src/preference";

export let pathPreferences: { [k: string]: IPathPreference } = {
  "/user/info": {},
  "/user/me": {},
  "/user/accesses/{id}": {},
  "/users": {},
  "/users/{id}": {},
  "/tasks": {},
  "/tasks/{id}": {},
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
