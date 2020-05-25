export type Id = string;

export type FuncVoid = () => void;

export enum EApiKind {
  public,
  internal,
}

export type ISimpleDict = {
  [k: string]: string;
};
