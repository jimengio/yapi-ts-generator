export interface IPathPreference {
  /** 跳过当前路径的生成 */
  ignored?: boolean;
  /** 基于该路径的返回结果生成一个 interface, 字符串传入名称 */
  generateInterface?: string;
  /** 返回类型, 默认 any */
  responseType?: string;
  /** 使用外部定义的类型名称 */
  existedBodyType?: string;
  existedQueryType?: string;
  existedGetResultType?: string;
  existedPostResultType?: string;
  existedPutResultType?: string;

  /** 使用外部定义的函数 */
  getFunc?: string;
  postFunc?: string;
  putFunc?: string;
  deleteFunc?: string;
  hookGetFunc?: string;
  hookPostFunc?: string;
  hookPutFunc?: string;
  hookDeleteFunc?: string;
}

export type IPathPreferenceConfigs = { [k: string]: IPathPreference };
