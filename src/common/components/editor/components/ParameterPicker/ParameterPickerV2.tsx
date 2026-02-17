import React, { useEffect, useState } from "react";
import { DatasourceTriggerConfig } from "../../../../actions/models/datasources/DatasourceTriggerConfig";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";
import { useFormConfigurationContext } from "../../../../helper/FormConfigurationContext";
import { ParameterV2 } from "./ParameterV2";
import { createInputParameterForDatasource, createOutputParamterForDatasourceTriggers, getNodeFromPath, mapFieldsToParamter } from "./ParameterMapperV2";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import log from "loglevel";
import { ParameterNodeRenderer } from "./ParameterNodeRenderer";
import { DataSourceDefinition } from "../../../../actions/models/datasources/DataSourceDefinition";
import { useParameterPickerResolutionContext } from "../conditionEditor/ParameterPickerResolutionContext";
import { findAllDatasourceTriggers } from "../../../../helper/EditorContextHelper";

export enum ParameterPickerLoadingOptions {
  FormFields = 1 << 0,
  DatasourceResults = 1 << 1, // 1
  DatasourceInputParameters = 1 << 2, // 2
  All = FormFields | DatasourceResults | DatasourceInputParameters
}

export const ParameterPickerV2 = (props: {
  onParameterPicked: (path: string | null, parameter: ParameterV2 | null) => void;
  selectedPath: string;
  parameterLoadingOptions: ParameterPickerLoadingOptions;
  datasourceIdForWhichParameterShouldBeCreated?: string;
  pathDelimiter: string;
  pathShouldStartWithDelimiter: boolean;
}): JSX.Element => {
  const [treeNodes, setTreeNodes] = useState<ParameterV2[]>([]);
  const normalizedSelectedPath = (() => {
    if (props.selectedPath === undefined || props.selectedPath === null || props.selectedPath === "") {
      return "";
    }
    if (props.pathShouldStartWithDelimiter === true && !props.selectedPath.startsWith(props.pathDelimiter)) {
      return props.pathDelimiter + props.selectedPath;
    }
    if (props.pathShouldStartWithDelimiter === false && props.selectedPath.startsWith(props.pathDelimiter)) {
      return props.selectedPath.substring(props.pathDelimiter.length);
    }
    return props.selectedPath;
  })();
  const componentContext = useComponentContext();
  const parameterPickerContext = useParameterPickerContext();
  const configContext = useFormConfigurationContext();
  const parameterResolutionContext = useParameterPickerResolutionContext();
  const context = useComponentContext();

  useEffect(() => {
    const createFormFieldsOnlyTreeNodes = (): ParameterV2[] => {
      return [
        {
          parameterName: "listItem",
          location: "",
          type: "",
          isExpandable: false,
          pathIsEditableThroughTextField: false,
          children: [
            ...mapFieldsToParamter(
              parameterPickerContext.listItemContextForParameterPicker
                .getListItem()
                .getProperties()
                .map((prop) => prop.description)
            )
          ]
        }
      ];
    };

    const buildRootNodes = async (allDatasourceActions: any[]): Promise<ParameterV2[]> => {
      const nodes: ParameterV2[] = [];
      const includeInputParameters = (props.parameterLoadingOptions & ParameterPickerLoadingOptions.DatasourceInputParameters) !== 0;
      const includeFormFields = (props.parameterLoadingOptions & ParameterPickerLoadingOptions.FormFields) !== 0 || includeInputParameters;
      const includeDatasourceResults = (props.parameterLoadingOptions & ParameterPickerLoadingOptions.DatasourceResults) !== 0 || includeInputParameters;

      const sharepointInputDatasourceIds = new Set<string>();

      if (includeInputParameters) {
        const parameterPromises = allDatasourceActions.map((ds) => {
          const datasourceDefintionsMatchingId: DataSourceDefinition[] = parameterPickerContext.editorModel.datasources.filter((df) => {
            return df.uniqueIdentifier === (ds.config as DatasourceTriggerConfig).datasourceIdWhichGetsTriggered;
          });

          if (datasourceDefintionsMatchingId.length > 0) {
            return createInputParameterForDatasource(configContext.swaggerDatasources, datasourceDefintionsMatchingId[0], componentContext.spHttpClient, context.context.pageContext.web.serverRelativeUrl).then(
              (inputParams) => {
                if (datasourceDefintionsMatchingId[0].typeName === "SharePointDatasource" && inputParams.length > 0) {
                  sharepointInputDatasourceIds.add(datasourceDefintionsMatchingId[0].uniqueIdentifier);
                }
                return inputParams;
              }
            );
          }

          return Promise.resolve([] as ParameterV2[]);
        });

        const awaitedParameters = await Promise.all(parameterPromises);
        awaitedParameters.forEach((awaitedParam) => {
          nodes.push(...awaitedParam);
        });
      }

      if (includeFormFields) {
        nodes.push(...createFormFieldsOnlyTreeNodes());
      }

      if (includeDatasourceResults) {
        const datasourceResultsNode = await createOutputParamterForDatasourceTriggers(
          configContext.swaggerDatasources,
          allDatasourceActions.map((a) => a.config as DatasourceTriggerConfig),
          parameterPickerContext.editorModel.datasources,
          componentContext.spHttpClient,
          context.context.pageContext.web.serverRelativeUrl
        );

        if (includeInputParameters && sharepointInputDatasourceIds.size > 0 && datasourceResultsNode.children && datasourceResultsNode.children.length > 0) {
          const filteredChildren = datasourceResultsNode.children.filter((child) => {
            const datasourceId = (child as any).__datasourceId as string | undefined;
            return datasourceId === undefined || !sharepointInputDatasourceIds.has(datasourceId);
          });

          nodes.push({ ...datasourceResultsNode, children: filteredChildren });
        } else {
          nodes.push(datasourceResultsNode);
        }
      }

      return nodes;
    };

    const prepareTreeNodesForParameter = async () => {
      let allDatasourceActions = findAllDatasourceTriggers(parameterPickerContext.editorModel);

      const resolveChildrenFromNode = (node: ParameterV2 | undefined): ParameterV2[] => {
        if (!node) return [];
        if (node.resolveChildren !== undefined) {
          return node.resolveChildren();
        }
        if (node.children !== undefined && node.children.length > 0) {
          const firstChild = node.children[0];
          if (firstChild?.pathIsEditableThroughTextField === true) {
            if (firstChild.resolveChildren !== undefined) {
              return firstChild.resolveChildren();
            }
            return firstChild.children ?? [];
          }
          return node.children;
        }
        return [];
      };

      // optional: datasource id filter (wie vorher)
      if (props.datasourceIdForWhichParameterShouldBeCreated !== undefined) {
        allDatasourceActions = allDatasourceActions.filter((ds) => (ds.config as DatasourceTriggerConfig).datasourceIdWhichGetsTriggered === props.datasourceIdForWhichParameterShouldBeCreated);
        if (allDatasourceActions.length > 1) {
          allDatasourceActions = [allDatasourceActions[0]]; // only show parameter for one datasource because they will be alle the same
        }
      }

      // ------------------------------------------------------------
      // Restriction-Mode (map/filter): nur Subtree anzeigen,
      // ABER zusätzlich weiterhin listItem + datasources auf Root.
      // KEIN global wrapper => kein führender "."
      // ------------------------------------------------------------
      if (parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom !== undefined && parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom !== "") {
        const restrictedNodes: ParameterV2[] = [];
        log.debug("Parameterpickerfield: dropdowns schould be determinded based on following object in ListItemContext: ", parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom);

        const splittedPath = parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom.split(".");
        let parameterPromises: Promise<void>[] | undefined = undefined;

        if (splittedPath.length >= 1) {
          const isFromDataSource = splittedPath[0] === "datasources";

          if (isFromDataSource === true) {
            const parameterNameOfDatasource = splittedPath[1];
            const datasourceActionsMatchingTheParameterName = allDatasourceActions.filter((f) => (f.config as DatasourceTriggerConfig).parameterName === parameterNameOfDatasource);

            parameterPromises = datasourceActionsMatchingTheParameterName.map(async (dsAction) => {
              const restrictedDatasourceNode: ParameterV2 = {
                isExpandable: false,
                location: "",
                parameterName: "",
                displayName: "datenquelle " + (dsAction.config as DatasourceTriggerConfig).parameterName + " (bezieht sich auf das uebergebene Datenobjekt)",
                pathIsEditableThroughTextField: false,
                type: ""
              };

              const nodesForDatasource = await createOutputParamterForDatasourceTriggers(
                configContext.swaggerDatasources,
                [dsAction.config as DatasourceTriggerConfig],
                parameterPickerContext.editorModel.datasources,
                componentContext.spHttpClient,
                context.context.pageContext.web.serverRelativeUrl
              );

              const matchingNode = getNodeFromPath([nodesForDatasource], "", parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom, props.pathDelimiter);

              if (parameterResolutionContext.restrictionComesFromArrayParameter === true) {
                let nodesToUse: ParameterV2[] = [];

                // ✅ defensiv: matchingNode oder children kann undefined sein (z.B. SharePoint DS ohne children an der Stelle)
                nodesToUse = resolveChildrenFromNode(matchingNode);

                if (nodesToUse.length === 0 && parameterResolutionContext.fallbackLeafName !== undefined && parameterResolutionContext.fallbackLeafName !== "") {
                  restrictedDatasourceNode.displayName =
                    "datenquelle " + (dsAction.config as DatasourceTriggerConfig).parameterName + " (" + parameterResolutionContext.fallbackLeafName + ")";
                  restrictedDatasourceNode.children = [];
                } else {
                  restrictedDatasourceNode.children = nodesToUse;
                }
                restrictedNodes.push(restrictedDatasourceNode);
              }
            });
          } else {
            // listitem parameter did get selected
            if (parameterResolutionContext.restrictionComesFromArrayParameter === true) {
              const listItemParameters = createFormFieldsOnlyTreeNodes();
              const matchingNode = getNodeFromPath(listItemParameters, "", parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom, props.pathDelimiter);

              const resolvedChildren = resolveChildrenFromNode(matchingNode);

              const sourcePathForDisplay = parameterResolutionContext.sourceParameterPath ?? parameterResolutionContext.pathWhereInfosSchouldGetLoadedFrom ?? "";
              const sourceParts = sourcePathForDisplay.split(".").filter((p) => p !== "");
              const sourceParameterName =
                sourceParts.length > 0 && sourceParts[0] === "listItem" ? sourceParts[sourceParts.length - 1] : sourceParts[sourceParts.length - 1] ?? "";
              const functionNameForDisplay = parameterResolutionContext.sourceFunctionName ?? "funktion";
              const wrapperDisplayName =
                (sourceParameterName !== "" ? "parameter " + sourceParameterName : "parameter") + " (rueckgabewert der funktion " + functionNameForDisplay + ")";

              if (resolvedChildren.length > 0) {
                restrictedNodes.push({
                  parameterName: "",
                  displayName: wrapperDisplayName,
                  location: "",
                  type: "any",
                  isExpandable: false,
                  pathIsEditableThroughTextField: false,
                  children: resolvedChildren
                });
              } else if (parameterResolutionContext.fallbackLeafName !== undefined && parameterResolutionContext.fallbackLeafName !== "") {
                restrictedNodes.push({
                  parameterName: "",
                  displayName: wrapperDisplayName,
                  location: "",
                  type: "any",
                  isExpandable: false,
                  pathIsEditableThroughTextField: false,
                  children: []
                });
              }
            }
          }
        }

        if (parameterPromises !== undefined) {
          await Promise.all(parameterPromises);
        }

        // ✅ Root weiterhin normal anzeigen (listItem + datasources),
        // aber restrictedNodes zusätzlich (Scope: iteriertes Element)
        const rootNodes = await buildRootNodes(allDatasourceActions);

        // Reihenfolge: erst restricted scope, dann Root (damit man schnell "das Element" sieht)
        setTreeNodes([...restrictedNodes, ...rootNodes]);
        return;
      }

      // ------------------------------------------------------------
      // Normal-Mode (wie vorher)
      // ------------------------------------------------------------
      const rootNodes = await buildRootNodes(allDatasourceActions);
      log.debug("going to set TreeNodes", rootNodes);
      setTreeNodes(rootNodes);
    };

    prepareTreeNodesForParameter();
  }, []);

  return (
    <>
      {treeNodes.map((n, index) => {
        return (
          <ParameterNodeRenderer
            key={"nodeRenderer_" + index}
            pathShouldStartWithDelimiter={props.pathShouldStartWithDelimiter}
            onParameterInformationChangedThroughTextBox={(changedParameter: ParameterV2) => {
              setTreeNodes((old) => {
                const newNodes = [...old];
                newNodes[index] = changedParameter;
                return newNodes;
              });
            }}
            selectedPath={normalizedSelectedPath}
            onParameterPicked={props.onParameterPicked}
            fullPath=""
            parameter={n}
            pathDelimiter={props.pathDelimiter}
          />
        );
      })}
    </>
  );
};
