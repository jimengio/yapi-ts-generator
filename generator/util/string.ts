/** Demo 中提供的 path 大致可能的格式
 *
 * /a/?c=d
 * /a/{id}
 * /a/a:unread
 *
 * 对于这些格式的进行打散, 方便生成对象的树形结构
 */
export let getPathChunks = (urlPath: string) => {
  let pieces = urlPath
    .split("?")[0] // 去掉 ? 后面的部分
    .split(/[\/\:]/) // 除了 / 也支持用 : 分割. 这里定义变量用是的花括号, 不影响
    .filter((x) => x !== "")
    .map((x) => {
      if (x.match(/^\{[\w\d]+\}$/)) {
        return "_";
      } else {
        return x;
      }
    });
  return pieces;
};

/** 基于 url 生成变量名 */
export let defineNameFromUrl = (originalUrl: string) => {
  let pieces = getPathChunks(originalUrl);
  let namePart = pieces.map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  return namePart;
};

export let defineResponseInterfaceName = (originalUrl: string, kind: "Post" | "Get" | "Put") => {
  let namePart = defineNameFromUrl(originalUrl);
  return `IApiResult${kind}_${namePart}`;
};

export let defineQueryInterfaceName = (originalUrl: string) => {
  let namePart = defineNameFromUrl(originalUrl);
  return `IApiQuery_${namePart}`;
};

export let defineBodyInterfaceName = (originalUrl: string, kind: "Put" | "Post") => {
  let namePart = defineNameFromUrl(originalUrl);
  return `IApiBody${kind}_${namePart}`;
};

export let grabPathname = (originalUrl: string) => {
  return originalUrl.split("?")[0].replace(/\{/g, "${");
};

export let markOptional = (x: string) => {
  if (x == null || x.trim() === "") {
    return "";
  } else {
    return `${x}?`;
  }
};

/** 空的参数会被去除 */
export let joinParams = (...xs: string[]) => {
  return xs.filter((x) => x != null && x.trim() !== "").join(",");
};

/** 定义泛型的类型当中不可以去掉空的元素, 使用 {} 代替 */
export let joinTypeParams = (...xs: string[]) => {
  return xs
    .map((x) => {
      if (x != null && x.trim() !== "") {
        return x;
      } else {
        return "{}";
      }
    })
    .join(",");
};

export let asStr = (x: string) => `\`${x}\``;

/** 目前支持 /api 和 /internal-api 两个 baseURL */
export let getBaseUrl = (tags: string[], originalUrl: string) => {
  let ns = tags[0].split(".")[0];
  switch (ns) {
    case "api":
      return `insertPublicHost(${JSON.stringify(originalUrl)})`;
    case "main":
      return `insertInternalHost(${JSON.stringify(originalUrl)})`;
    default:
      console.log(tags);
      throw new Error("Not support API namespace");
  }
};

/** 目前支持 /api 和 /internal-api, 分别为 public 和 internal */
export let getBaseUrlKind = (tags: string[]) => {
  let ns = tags[0].split(".")[0];
  switch (ns) {
    case "api":
      return `EApiKind.public`;
    case "main":
      return `EApiKind.internal`;
    default:
      console.log(tags);
      throw new Error("Not support API namespace");
  }
};

/** 平台的 API 包含 public API 和 internal API, 在 swagger 当中通过 tag 来区分 */
export let byPublicApi = (tags: string[]) => {
  if (tags == null || tags.length === 0) {
    return false;
  }
  let ns = tags[0].split(".")[0];
  return ns === "api";
};

export type FuncTagFilter = (tags: string[]) => boolean;

export let byInternalApi = (tags: string[]) => {
  if (tags == null || tags.length === 0) {
    return false;
  }
  let ns = tags[0].split(".")[0];
  return ns === "main";
};
