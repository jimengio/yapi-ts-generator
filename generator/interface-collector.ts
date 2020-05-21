let interfaceList: string[] = [];

export let collectInterface = (name: string, code: string) => {
  interfaceList.push(`export interface ${name} ${code}`);
};

export let collectSimpleType = (name: string, code: string) => {
  interfaceList.push(`export type ${name} = ${code}`);
};

export let getCodeOfAllInterfaces = () => {
  return interfaceList
    .slice()
    .sort()
    .join("\n");
};

export let clearInterfacesList = () => {
  interfaceList = [];
};
