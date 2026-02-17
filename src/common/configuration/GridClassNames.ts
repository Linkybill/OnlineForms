import { IGridStyleClassNames } from "./models/IGridStyleClassNames";

export class ClassNames {
  // todo: integrate breakpoints etc.... and other sizes as well.
  static gridStyleClassNames: IGridStyleClassNames = {
    cellClassName: "ms-Grid-col",
    gridClassName: "ms-Grid",
    rowClassName: "ms-Grid-row",
    smallClassNamesOneUntilTwelve: ["ms-sm1", "ms-sm2", "ms-sm3", "ms-sm4", "ms-sm5", "ms-sm6", "ms-sm7", "ms-sm8", "ms-sm9", "ms-sm10", "ms-sm11", "ms-sm12"],
    mdClassNamesFromOneUntilTwelve: ["ms-md1", "ms-md2", "ms-md3", "ms-md4", "ms-md5", "ms-md6", "ms-md7", "ms-md8", "ms-md9", "ms-md10", "ms-md11", "ms-md12"],
    lgClassNamesFromOneUntilTwelve: ["ms-lg1", "ms-lg2", "ms-lg3", "ms-lg4", "ms-lg5", "ms-lg6", "ms-lg7", "ms-lg8", "ms-lg9", "ms-lg10", "ms-lg11", "ms-lg12"],
    xlClassNamesFromOneUntilTwelve: ["ms-xl1", "ms-xl2", "ms-xl3", "ms-xl4", "ms-xl5", "ms-xl6", "ms-xl7", "ms-xl8", "ms-xl9", "ms-xl10", "ms-xl11", "ms-xl12"],
    xxlClassNamesFromOneUntilTwelve: ["ms-xxl1", "ms-xxl2", "ms-xxl3", "ms-xxl4", "ms-xxl5", "ms-xxl6", "ms-xxl7", "ms-xxl8", "ms-xxl9", "ms-xxl10", "ms-xxl11", "ms-xxl12"],
    xxxlClassNamesFromOneUntilTwelve: ["ms-xxxl1", "ms-xxxl2", "ms-xxxl3", "ms-xxxl4", "ms-xxxl5", "ms-xxxl6", "ms-xxxl7", "ms-xxxl8", "ms-xxxl9", "ms-xxxl10", "ms-xxxl11", "ms-xxxl12"]
  };
}
