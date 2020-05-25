import { IPathPreference, IPathPreferenceConfigs } from "../preference";

import {
  Path as SwaggerPathConfig,
  Operation as SwaggerPathOperation,
  Parameter as SwaggerParameter,
  QueryParameter as SwaggerQueryParameter,
  BodyParameter as SwaggerBodyParameter,
  Response as SwaggerResponse,
} from "swagger-schema-official";
import {
  defineNameFromUrl,
  defineQueryInterfaceName,
  defineResponseInterfaceName,
  defineBodyInterfaceName,
  grabPathname,
  joinParams,
  asStr,
  getBaseUrl,
  getBaseUrlKind,
  joinTypeParams,
} from "./util/string";
import { generateOptionsInterfaceCode, generateDataInterfaceCode } from "./data-type";
import { collectInterface, collectSimpleType } from "./interface-collector";
import { ISimpleDict } from "../types";

let apiType = "IJimuApiOption";

let getPathParamsCode = (pathname: string) => {
  let params = (pathname.match(/\{(\w+)\}/g) || []).map((x) => x.slice(1, x.length - 1));
  let paramsWithType = params.map((x) => `${x}:Id`).join(",");
  return paramsWithType;
};

/** 生成请求的 query 参数和类型 */
let getQueryOptionsCode = (
  originalUrl: string,
  parameters: SwaggerParameter[],
  existedName: string,
  definedQueryTypes?: ISimpleDict,
  disableCollecting?: boolean
) => {
  let queryParameters = parameters.filter((x) => x.in === "query").map((x) => x as SwaggerQueryParameter);

  let queryOptionsCode = "";
  let optionsCode = "{}";
  let queryName = "";
  if (queryParameters.length > 0) {
    queryName = defineQueryInterfaceName(originalUrl);
    let queryCode = generateOptionsInterfaceCode(queryParameters, "any", definedQueryTypes);

    if (!disableCollecting) {
      collectInterface(queryName, queryCode);
    }

    // 如果有已经存在的类型定义, 那么返回已经存在的定义名称
    if (existedName != null) {
      queryName = existedName;
    }

    queryOptionsCode = `q?:${queryName}`;
    optionsCode = "q";
  }

  return {
    nameWithType: queryOptionsCode,
    name: optionsCode,
    type: queryName,
  };
};

/** 生成请求的 body 参数和类型 */
let getBodyCode = (originalUrl: string, parameters: SwaggerParameter[], existedName: string, kind: "Post" | "Put", disableCollecting?: boolean) => {
  let bodyParamCode = "body: object";
  let bodyType = "object";
  let bodyParams = parameters.filter((p) => p.in === "body");
  if (bodyParams.length > 1) {
    console.log(originalUrl, bodyParams);
    throw new Error("应该只有一个 body 参数");
  }
  if (bodyParams.length === 1) {
    let bodyParameter = bodyParams[0] as SwaggerBodyParameter;
    let bodyName = defineBodyInterfaceName(originalUrl, kind);

    if (!disableCollecting) {
      if (bodyParameter.schema.type === "object") {
        collectInterface(bodyName, generateDataInterfaceCode(originalUrl, bodyParameter.schema));
      } else {
        // TODO, 算是不合法的结构, 目前的数据都是 object
        collectInterface(bodyName, `{/** TODO: not supported type ${bodyParameter.schema.type} */}`);
      }
    }

    // 如果有已经存在的类型定义, 那么返回已经存在的定义名称
    if (existedName != null) {
      bodyName = existedName;
    }

    bodyParamCode = `body: ${bodyName}`;
    bodyType = bodyName;
  }

  return {
    name: "body",
    type: bodyType,
    nameWithType: bodyParamCode,
  };
};

let getDocumentCode = (originalUrl: string, operation: SwaggerPathOperation, p: IPathPreference) => {
  let metion = "";
  if (
    p.existedQueryType != null ||
    p.existedBodyType != null ||
    p.existedGetResultType != null ||
    p.existedPostResultType != null ||
    p.existedPutResultType != null
  ) {
    metion = ` _${defineNameFromUrl(originalUrl)}`;
  }
  return `\n/** ${operation.summary}${operation.description}${metion} */\n`;
};

let getResponseCode = (
  originalUrl: string,
  responses: SwaggerPathOperation["responses"],
  kind: "Post" | "Get" | "Put",
  existedName: string,
  disableCollecting?: boolean
) => {
  let okResult = responses["200"] as SwaggerResponse;

  if (okResult == null) {
    console.log(originalUrl, responses);
    throw new Error("没有 200 结果的数据");
  }

  let name = defineResponseInterfaceName(originalUrl, kind);

  let typesCode = generateDataInterfaceCode(originalUrl, okResult.schema);

  if (!disableCollecting) {
    switch (okResult.schema.type) {
      case "object":
        collectInterface(name, typesCode);
        break;
      case "array":
        collectSimpleType(name, typesCode);
        break;
      case "string":
        collectSimpleType(name, `${typesCode} /** TODO: 一般应该是对象, 少数是数组 */`);
        break;
      default:
        collectSimpleType(name, `${typesCode} /** TODO: 一般应该是对象, 少数是数组 */`);
    }
  }

  // 如果有已经存在的类型定义, 那么返回已经存在的定义名称
  if (existedName != null) {
    name = existedName;
  }

  return {
    type: name,
    typeDefs: typesCode,
  };
};

// 定义各个请求具体生成代码的逻辑

let genGetFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes);
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Get", preference.existedGetResultType);

  // GET 应该没有 body

  if (preference.getFunc != null) {
    return `${doc}GET: ${preference.getFunc},`;
  }

  return (
    `${doc}GET: (${joinParams(pathParams, genQuery.nameWithType, `opts?: ${apiType}`)}) =>` +
    ` ajaxGet<${genResponse.type}>(${joinParams(base, asStr(pathname), genQuery.name, `opts`)}),`
  );
};

let genPostFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes);
  let genBody = getBodyCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedBodyType, "Post");
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Post", preference.existedPostResultType);

  if (preference.postFunc != null) {
    return `${doc}POST: ${preference.postFunc},`;
  }

  return (
    `${doc}POST: (${joinParams(pathParams, genBody.nameWithType, genQuery.nameWithType, `opts?: ${apiType}`)}) =>` +
    ` ajaxPost<${genResponse.type}>(${joinParams(base, asStr(pathname), genBody.name, genQuery.name, `opts`)}),`
  );
};

let genPutFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes);
  let genBody = getBodyCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedBodyType, "Put");
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Put", preference.existedPutResultType);

  if (preference.putFunc != null) {
    return `${doc}PUT: ${preference.putFunc},`;
  }

  return (
    `${doc}PUT: (${joinParams(pathParams, genBody.nameWithType, genQuery.nameWithType, `opts?: ${apiType}`)}) =>` +
    ` ajaxPut<${genResponse.type}>(${joinParams(base, asStr(pathname), genBody.name, genQuery.name, `opts`)}),`
  );
};

let genDeleleFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference) => {
  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  // 目前认为 DELETE 帮助带 query 也不会带 body

  if (preference.deleteFunc != null) {
    return `${doc}DELETE: ${preference.deleteFunc},`;
  }

  return `${doc}DELETE: (${joinParams(pathParams, `opts?: ${apiType}`)}) => ajaxDelete(${joinParams(base, asStr(pathname), `opts`)}),`;
};

// Generate Hooks API

let genUseGetFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let baseKind = getBaseUrlKind(pathOperation.tags);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes, true);
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Get", preference.existedGetResultType, true);

  if (preference.hookGetFunc != null) {
    return `${doc}useGET: ${preference.hookGetFunc},`;
  }

  // GET 应该没有 body

  return (
    `${doc}useGET: (${joinParams(pathParams, genQuery.nameWithType, `opts?: ${apiType}`)}) => ` +
    ` hooksGet<${joinParams(genResponse.type, genQuery.type)}>(${joinParams(base, asStr(pathname), genQuery.name, `opts`)}),` +
    `${doc}dynamicGET: () => dynamicGet<${joinTypeParams(genResponse.type, genQuery.type, `{${pathParams}}`)}, >(${joinParams(
      baseKind,
      JSON.stringify(pathname)
    )}),`
  );
};

let genUsePostFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let baseKind = getBaseUrlKind(pathOperation.tags);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes, true);
  let genBody = getBodyCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedBodyType, "Post", true);
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Post", preference.existedGetResultType, true);

  if (preference.hookPostFunc != null) {
    return `${doc}usePOST: ${preference.hookPostFunc},`;
  }

  // GET 应该没有 body

  return (
    `${doc}usePOST: (${pathParams}) => hooksPost<${joinParams(genResponse.type, genBody.type, genQuery.type)}>(${joinParams(base, asStr(pathname))}),` +
    `${doc}dynamicPOST: () => dynamicPost<${joinTypeParams(genResponse.type, genBody.type, genQuery.type, `{${pathParams}}`)}, >(${joinParams(
      baseKind,
      JSON.stringify(pathname)
    )}),`
  );
};

let genUsePutFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference, definedQueryTypes: ISimpleDict) => {
  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let baseKind = getBaseUrlKind(pathOperation.tags);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  let genQuery = getQueryOptionsCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedQueryType, definedQueryTypes, true);
  let genBody = getBodyCode(originalUrl, pathOperation.parameters as SwaggerParameter[], preference.existedBodyType, "Put", true);
  let genResponse = getResponseCode(originalUrl, pathOperation.responses, "Put", preference.existedGetResultType, true);

  if (preference.hookPutFunc != null) {
    return `${doc}usePUT: ${preference.hookPutFunc},`;
  }

  // GET 应该没有 body

  return (
    `${doc}usePUT: (${pathParams}) => hooksPut<${joinParams(genResponse.type, genBody.type, genQuery.type)}>(${joinParams(base, asStr(pathname))}),` +
    `${doc}dynamicPut: () => dynamicPut<${joinTypeParams(genResponse.type, genBody.type, genQuery.type, `{${pathParams}}`)}>(${joinParams(
      baseKind,
      JSON.stringify(pathname)
    )}),`
  );
};

let genUseDeleteFunc = (originalUrl: string, pathOperation: SwaggerPathOperation, preference: IPathPreference) => {
  let base = getBaseUrl(pathOperation.tags, originalUrl);
  let baseKind = getBaseUrlKind(pathOperation.tags);
  let pathname = grabPathname(originalUrl);
  let pathParams = getPathParamsCode(pathname);

  let doc = getDocumentCode(originalUrl, pathOperation, preference);

  if (preference.hookDeleteFunc != null) {
    return `${doc}useDELETE: ${preference.hookDeleteFunc},`;
  }

  // GET 应该没有 body

  return (
    `${doc}useDELETE: (${pathParams}) => hooksDelete(${joinParams(base, asStr(pathname))}),` +
    `${doc}dynamicDELETE: () => dynamicDelete<{${pathParams}}>(${joinParams(baseKind, JSON.stringify(pathname))}),`
  );
};

// Generate all

export let generateApiFunctions = (
  originalUrl: string,
  pathConfig: SwaggerPathConfig,
  tagFilter: (tags: string[]) => boolean,
  pathPreferences: IPathPreferenceConfigs,
  definedQueryTypes: ISimpleDict
) => {
  let result = "";
  let preference = pathPreferences[originalUrl] ?? {};

  if (pathConfig.get != null && tagFilter(pathConfig.get.tags)) {
    result += genGetFunc(originalUrl, pathConfig.get, preference, definedQueryTypes);
    result += genUseGetFunc(originalUrl, pathConfig.get, preference, definedQueryTypes);
  }

  if (pathConfig.post != null && tagFilter(pathConfig.post.tags)) {
    result += genPostFunc(originalUrl, pathConfig.post, preference, definedQueryTypes);
    result += genUsePostFunc(originalUrl, pathConfig.post, preference, definedQueryTypes);
  }

  if (pathConfig.put != null && tagFilter(pathConfig.put.tags)) {
    result += genPutFunc(originalUrl, pathConfig.put, preference, definedQueryTypes);
    result += genUsePutFunc(originalUrl, pathConfig.put, preference, definedQueryTypes);
  }

  if (pathConfig.delete != null && tagFilter(pathConfig.delete.tags)) {
    result += genDeleleFunc(originalUrl, pathConfig.delete, preference);
    result += genUseDeleteFunc(originalUrl, pathConfig.delete, preference);
  }

  return result;
};
