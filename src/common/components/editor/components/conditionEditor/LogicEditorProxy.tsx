import React from "react";
import { LogicExpressionType } from "./types/LogicTypes";

import { LogicParameterType } from "./Models/OperationValidationModel";
import { LogicExpressionItemEditor } from "./LogicExpressionItemEditor";
import { FlexTable } from "../../../../actions/components/flexTable/FlexTable";
import { FlexRow } from "../../../../actions/components/flexTable/FlexRow";
import { FlexCell } from "../../../../actions/components/flexTable/FlexCell";

export const LogicEditorProxy = (props: {
  showFunctionsOnly?: boolean;
  logicExpression: LogicExpressionType | string | number | boolean | null;
  expressionShouldProduceType: LogicParameterType;
  calledByFunctionName?: string;
  onLogicUpdated: (logicObject: LogicExpressionType | undefined | null | string | number | boolean) => void;
}): JSX.Element => {
  return (
    <FlexTable>
      <FlexRow>
        <FlexCell>
          <LogicExpressionItemEditor {...props} />
        </FlexCell>
      </FlexRow>
    </FlexTable>
  );
};
