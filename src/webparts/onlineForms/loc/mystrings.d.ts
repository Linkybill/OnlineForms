export interface IStrings {
  [key: string]: string;
}

declare module 'OnlineFormsWebPartStrings' {
  const strings: IStrings;
  export = strings;
}
