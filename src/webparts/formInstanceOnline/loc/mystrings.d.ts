export interface IStrings {
  [key: string]: string;
}

declare module 'FormInstanceOnlineWebPartStrings' {
  const strings: IStrings;
  export = strings;
}
