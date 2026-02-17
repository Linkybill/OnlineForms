import React, { useRef, useState } from "react";
import { Grid } from "../../../grid/grid";
import { ActionButton, ITextField, TextField, Toggle } from "@fluentui/react";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import { usePermissionContext } from "../../../../helper/PermissionContext";
import log from "loglevel";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";
import { LogicRootEditor } from "./LogicRootEditor";
import { LogicParameterType } from "./Models/OperationValidationModel";
import { LabelWithRequiredInfo } from "../../../../listItem/labelWithRequiredInfo";
import { useUILogger } from "../../../../logging/UseUiLogger";
import { LogViewer } from "../../../../logging/LogViewer";
import { DemoDataEditor } from "./DemoDataEditor";
import { ListItem } from "../../../../listItem/ListItem";
import { JsonLogicHelper } from "../../../../helper/JSONLogicHelper";

export const ConditionEditor = (props: { conditionShouldProduceType: LogicParameterType; label: string; condition: string | undefined; onChange: (changedText: string) => void }): JSX.Element => {
  const { logs, logToUI } = useUILogger();

  const [showFunctionAsText, setShowFunctionAsText] = useState<boolean>(false);
  const [demoDataEditorVisible, setDemoDataEditorVisible] = useState<boolean>(false);
  const conditionToUse = props.condition === undefined ? "" : props.condition;

  const inputRef = useRef<ITextField>();

  const permissionContext = usePermissionContext();
  const parameterContext = useParameterPickerContext();
  const componentContext = useComponentContext();

  // Helper einmalig instanzieren (ohne Cache, löst filter/map/reduce Scope-Probleme)
  const logicHelperRef = useRef<JsonLogicHelper | null>(null);
  if (logicHelperRef.current === null) {
    logicHelperRef.current = new JsonLogicHelper(componentContext.context, parameterContext.listItemContextForParameterPicker, 1, permissionContext);
  }

  log.debug("rendering condition editor with", props);

  let conditionObject: any = undefined;
  try {
    conditionObject = JSON.parse(props.condition as any);
  } catch (e) {
    conditionObject = undefined;
  }

  return (
    <>
      <Grid
        gridConfig={{
          rows: [
            {
              cells: [
                {
                  content: (
                    <>
                      <>
                        <LabelWithRequiredInfo required={false} text={props.label} />
                        <LogicRootEditor
                          expressionShouldProducetype={props.conditionShouldProduceType}
                          logicExpression={conditionObject}
                          onLogicUpdated={(newObject) => {
                            props.onChange(JSON.stringify(newObject));
                          }}
                        />
                      </>
                      <Toggle
                        label={"Funktion als Text anzeigen"}
                        defaultChecked={false}
                        onText="Text ausblenden"
                        offText="Text einblenden"
                        onChange={(ev, val) => {
                          setShowFunctionAsText(!!val);
                        }}
                      />
                      {showFunctionAsText === true && (
                        <>
                          <TextField
                            label={props.label}
                            value={conditionToUse}
                            onChange={(ev, val) => {
                              props.onChange(val ?? "");
                            }}
                            componentRef={(ref) => {
                              inputRef.current = ref ?? undefined;
                            }}
                            multiline={true}
                          />
                        </>
                      )}
                      <ActionButton
                        text="Testdaten für diese Funktion festlegen"
                        onClick={() => {
                          setDemoDataEditorVisible(true);
                        }}
                      />
                      <ActionButton
                        text="Bedingung auswerten"
                        onClick={() => {
                          try {
                            const liCtx = parameterContext.listItemContextForParameterPicker;

                            // 👇 Ein Call statt: createDataForJsonLogic + JSONLogicInstance + JSON.parse + apply
                            const result = logicHelperRef.current!.evaluate(conditionToUse, liCtx.getListItem(), liCtx.getDatasourceResults());

                            logToUI({
                              // optional fürs UI-Logging: du kannst dir hier weiterhin Data zeigen lassen
                              dataobject: {
                                // rein informativ fürs Log-Viewer: damit du siehst was reinging
                                listItem: liCtx.getListItem(),
                                datasources: liCtx.getDatasourceResults()
                              },
                              logicObject: "JsonLogicHelper.evaluate()",
                              result
                            });
                          } catch (e) {
                            logToUI({
                              dataobject: { condition: conditionToUse },
                              logicObject: "JsonLogicHelper.evaluate()",
                              result: e
                            });
                          }
                        }}
                      />
                      <LabelWithRequiredInfo required={false} text="Ergebnis" />
                      <LogViewer logs={logs.length > 0 ? [logs[logs.length - 1]] : []} />
                    </>
                  ),
                  uniqueKey: "conditionEditorCondition",
                  widths: { smWidth: 12 }
                }
              ]
            }
          ]
        }}
      />

      {demoDataEditorVisible == true && (
        <>
          <ModalWithCloseButton
            title="Demodaten festlegen"
            isOpen={true}
            onClose={() => {
              setDemoDataEditorVisible(false);
            }}>
            <>
              <DemoDataEditor
                onCancel={() => {
                  setDemoDataEditorVisible(false);
                }}
                onDataApproved={(listItem: ListItem) => {
                  log.debug("demo data got approved", listItem);
                  setDemoDataEditorVisible(false);
                }}
                condition={conditionObject}
              />
            </>
          </ModalWithCloseButton>
        </>
      )}
    </>
  );
};
