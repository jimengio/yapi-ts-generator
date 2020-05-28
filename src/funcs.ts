import { get, post, put, del, IJimuApiOption } from "@jimengio/api-base";
import { useState, useEffect } from "react";
import { useDeepCompareEffectNoCheck } from "use-deep-compare-effect";
import * as queryString from "query-string";

let joinUrl = (base: string, path: string, params?: { [k: string]: any }) => {
  let searchParams = queryString.stringify(params);
  if (searchParams.length > 0) {
    return `${base.replace(/\/$/, "")}${path}?${searchParams}`;
  }
  return `${base.replace(/\/$/, "")}${path}`;
};

export let ajaxGet = <T = any>(base: string, url: string, options: object, apiOptions: IJimuApiOption): Promise<T> => {
  return get({
    baseURL: base,
    url: url,
    query: options,
    ...apiOptions,
  });
};

export let ajaxPost = <T = any>(base: string, url: string, body: any, options: object, apiOptions: IJimuApiOption): Promise<T> => {
  return post({
    baseURL: base,
    url: url,
    query: options,
    data: body,
    ...apiOptions,
  });
};

export let ajaxPut = <T = any>(base: string, url: string, body: any, options: object, apiOptions: IJimuApiOption): Promise<T> => {
  return put({
    baseURL: base,
    url: url,
    query: options,
    data: body,
    ...apiOptions,
  });
};

export let ajaxDelete = (base: string, url: string, apiOptions: IJimuApiOption): Promise<void> => {
  return del({
    baseURL: base,
    url: url,
    ...apiOptions,
  });
};

export let dynamicGet = <RESULT, S = any, PARAMS = { [k: string]: any }>(base: string, originalUrl: string) => {
  let [result, setResult] = useState<RESULT>(undefined);
  let [isLoading, setLoading] = useState(false);

  let loadData = async (params: PARAMS, options?: S, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    let replacedUrl = relpaceTemplate(originalUrl, params);

    try {
      let r = await get<RESULT>({
        baseURL: base,
        url: replacedUrl,
        query: options as any,
        ...apiOptions,
      });
      setResult(r);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * 获取字符串格式的 GET URL 地址
   * @param pathOnly 返回值不包含 api base 部分
   */
  let getUrl = (params: PARAMS, query: S, pathOnly?: boolean) => {
    let replacedUrl = relpaceTemplate(originalUrl, params);

    if (pathOnly) {
      return replacedUrl;
    }

    return joinUrl(base, replacedUrl, query);
  };

  return {
    result,
    loadData,
    isLoading,
    getUrl,
  };
};

export let hooksGet = <RESULT, S = any>(base: string, url: string, options: S, apiOptions: IJimuApiOption) => {
  let [result, setResult] = useState<RESULT>(undefined);
  let [isLoading, setLoading] = useState(false);

  let loadData = async (options?: S, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    try {
      let r = await get<RESULT>({
        baseURL: base,
        url: url,
        query: options as any,
        ...apiOptions,
      });
      setResult(r);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useDeepCompareEffectNoCheck(() => {
    loadData(options as any, apiOptions);
  }, [url, options]);

  return {
    result,
    loadData,
    isLoading,
  };
};

export let dynamicPost = <RESULT, BODY, OPTIONS = any, PARAMS = { [k: string]: any }>(base: string, originalUrl: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (params: PARAMS, body: BODY, options?: OPTIONS, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    let replacedUrl = relpaceTemplate(originalUrl, params);

    try {
      let r = await post<RESULT>({
        baseURL: base,
        url: replacedUrl,
        data: body,
        query: options as any,
        ...apiOptions,
      });
      setLoading(false);
      return r;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * 获取字符串格式的 POST URL 地址
   * @param params 对象形式传入 url 当中的参数
   * @param pathOnly 返回值不包含 api base 部分
   */
  let getUrl = (params: PARAMS, pathOnly?: boolean) => {
    let replacedUrl = relpaceTemplate(originalUrl, params);
    if (pathOnly) {
      return replacedUrl;
    }
    return joinUrl(base, replacedUrl);
  };

  return {
    request,
    isLoading,
    getUrl,
  };
};

export let hooksPost = <RESULT, BODY, OPTIONS = any>(base: string, url: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (body: BODY, options?: OPTIONS, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    try {
      let r = await post<RESULT>({
        baseURL: base,
        url: url,
        data: body,
        query: options as any,
        ...apiOptions,
      });
      setLoading(false);
      return r;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    request,
    isLoading,
  };
};

let relpaceTemplate = (template: string, params: { [k: string]: any }): string => {
  let x = template;
  for (let k in params) {
    let value = params[k];
    if (value == null || value === "") {
      throw new Error("Can't fill empty into a template url!");
    }
    x = x.replace(`\${${k}}`, value);
  }
  return x;
};

export let dynamicPut = <RESULT, BODY, OPTIONS = any, PARAMS = { [k: string]: any }>(base: string, originalUrl: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (params: PARAMS, body: BODY, options?: OPTIONS, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);

    let replacedUrl = relpaceTemplate(originalUrl, params);
    try {
      let r = await put<RESULT>({
        baseURL: base,
        url: replacedUrl,
        data: body,
        query: options as any,
        ...apiOptions,
      });
      setLoading(false);
      return r;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * 获取字符串格式的 PUT URL 地址
   * @param params 对象形式传入 url 当中的参数
   * @param pathOnly 返回值不包含 api base 部分
   */
  let getUrl = (params: PARAMS, pathOnly?: boolean) => {
    let replacedUrl = relpaceTemplate(originalUrl, params);
    if (pathOnly) {
      return replacedUrl;
    }
    return joinUrl(base, replacedUrl);
  };

  return {
    request,
    isLoading,
    getUrl,
  };
};

export let hooksPut = <RESULT, BODY, OPTIONS = any>(base: string, url: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (body: BODY, options?: OPTIONS, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    try {
      let r = await put<RESULT>({
        baseURL: base,
        url: url,
        data: body,
        query: options as any,
        ...apiOptions,
      });
      setLoading(false);
      return r;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    request,
    isLoading,
  };
};

export let dynamicDelete = <PARAMS = { [k: string]: any }>(base: string, originalUrl: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (params: PARAMS, apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);

    let replacedUrl = relpaceTemplate(originalUrl, params);
    try {
      let r = await del<void>({
        baseURL: base,
        url: replacedUrl,
        ...apiOptions,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    request,
    isLoading,
  };
};

export let hooksDelete = (base: string, url: string) => {
  let [isLoading, setLoading] = useState(false);

  let request = async (apiOptions?: IJimuApiOption) => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    try {
      let r = await del<void>({
        baseURL: base,
        url: url,
        ...apiOptions,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    request,
    isLoading,
  };
};
