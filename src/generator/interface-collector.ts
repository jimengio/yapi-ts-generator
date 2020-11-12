/**
 * 收集用到哪些类型, 会统一生成出来, 就是使用的时候名字比较长的哪些类型
 * 功能比较简单, 应该够用了, 目前就是全局的, 类型不做数据
 */
let interfaceList: string[] = [];

export let collectInterface = (name: string, code: string) => {
  interfaceList.push(`export interface ${name} ${code}`);
};

export let collectSimpleType = (name: string, code: string) => {
  interfaceList.push(`export type ${name} = ${code}`);
};

export let getCodeOfAllInterfaces = () => {
  return interfaceList.slice().sort().join("\n");
};

export let clearInterfacesList = () => {
  interfaceList = [];
};
