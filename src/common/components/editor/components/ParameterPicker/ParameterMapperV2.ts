import log from "loglevel";
import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";
import { FieldDescription } from "../../../../listItem/fields/base/FieldDescription";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../../../listItem/types/FieldValueTypes";
import { DataSourceDefinition } from "../../../../actions/models/datasources/DataSourceDefinition";
import { SPHttpClient } from "@microsoft/sp-http";
import { SwaggerDatasourceConfig } from "../../../../actions/models/datasources/SwaggerDatasourceConfig";
import { loadSwaggerSchema } from "../../../../actions/services/SwaggerService";
import { DatasourceTriggerConfig } from "../../../../actions/models/datasources/DatasourceTriggerConfig";
import { SharePointDatasourceConfig } from "../../../../actions/models/datasources/SharePointDatasourceConfig";
import { loadFieldSchemaByServerRelativeUrl } from "../../../../listItem/helper/ListHelper";
import { DatasourceTypeNames } from "../../../../actions/models/datasources/DataSourceTypes";
import { resolveReference } from "../../../../actions/mapper/swagger/ResolveReference";
import { findOperationIdObject } from "../../../../actions/helper/DatasourceHelper";
import { KnownSwaggerDatasource } from "../../../../actions/models/datasources/KnownSwaggerDatasource";
import { ParameterV2 } from "./ParameterV2";
import { ListFieldDescription } from "../../../../listItem/fields/listField/ListFieldDescription";
import { CustomTemplatedListFieldDescription } from "../../../../listItem/fields/customTemplatedListField/CustomTemplatedListFieldDescription";
import { ChoiceFieldDescription } from "../../../../listItem/fields/choiceField/ChoiceFieldDescription";
import { sp } from "@pnp/sp";

export const createInputParameterForDatasource = async (
  knownSwaggerSources: KnownSwaggerDatasource[],
  datasourceDefiniton: DataSourceDefinition,
  spHttpClient: SPHttpClient,
  currentServerRelativeSharePointUrl: string
): Promise<ParameterV2[]> => {
  if (datasourceDefiniton === undefined) {
    return [];
  }
  switch (datasourceDefiniton.typeName) {
    case DatasourceTypeNames.SwaggerDatasource:
      return createInputParameterForSwaggerDatasource(knownSwaggerSources, datasourceDefiniton, spHttpClient);
    case DatasourceTypeNames.SharePointDatasource: {
      const params = await createInputOrOutputParameterTreeNodesForSharePointDatasource(datasourceDefiniton.datasourceConfig as SharePointDatasourceConfig, currentServerRelativeSharePointUrl);
      return params;
    }
  }
};

const createInputParameterForSwaggerDatasource = async (knownSwaggerSources: KnownSwaggerDatasource[], datasourceDefiniton: DataSourceDefinition, spHttpClient: SPHttpClient): Promise<ParameterV2[]> => {
  const parameterToReturn: ParameterV2[] = [];

  const swaggerConfig = datasourceDefiniton.datasourceConfig as SwaggerDatasourceConfig;
  const matchingSwaggerSource = knownSwaggerSources.filter((ds) => ds.identifier === swaggerConfig.knownSwaggerDatasourceId);
  if (matchingSwaggerSource.length === 0) {
    log.error("no swagger info url is configured for provided id", swaggerConfig, knownSwaggerSources);
    throw new Error("no swagger source found");
  }
  const swaggerUrlToUse = matchingSwaggerSource[0].swaggerInfoUrl;
  const swaggerJson = await loadSwaggerSchema(swaggerUrlToUse, spHttpClient);
  const pathObject = findOperationIdObject(swaggerJson, swaggerConfig.operationId, swaggerConfig.operationType);

  const parameters = pathObject[swaggerConfig.operationType].parameters;

  if (
    pathObject[swaggerConfig.operationType].requestBody !== undefined &&
    pathObject[swaggerConfig.operationType].requestBody.content !== undefined &&
    pathObject[swaggerConfig.operationType].requestBody.content["application/json"] !== undefined
  ) {
    const bodySchema = pathObject[swaggerConfig.operationType]?.requestBody?.content?.["application/json"]?.schema;
    if (bodySchema !== undefined) {
      if (bodySchema.$ref !== undefined) {
        const reference = pathObject[swaggerConfig.operationType].requestBody.content["application/json"].schema.$ref;
        var splittedReference = reference.split("/");
        const parameterName = splittedReference[splittedReference.length - 1];
        const node = createExpandableReferenceNode(swaggerJson, reference, "", parameterName, "body");
        parameterToReturn.push(node);
      } else if (bodySchema.type === "object") {
        parameterToReturn.push({
          parameterName: "listItemObject", // oder "body"
          location: "body",
          isExpandable: false, // freies Objekt -> nicht expandierbar
          pathIsEditableThroughTextField: false,
          type: "object"
        });
      }
    }
  }

  if (Array.isArray(parameters)) {
    for (let i = 0; i < parameters.length; i++) {
      const p = parameters[i];
      const location = p.in === undefined || p.in === null ? "" : (p.in as string);

      let typeFromSchema: string | undefined = undefined;

      if (p.schema !== undefined) {
        if (p.schema.$ref !== undefined) {
          const pathToUse = p.name;

          const node = createExpandableReferenceNode(swaggerJson, p.schema.$ref, pathToUse, p.name, location);
          parameterToReturn.push(node);
          break;
        } else {
          typeFromSchema = p.schema.type;
        }
      }

      const typeToCheck = typeFromSchema !== undefined ? typeFromSchema : p.type;

      switch (typeToCheck) {
        case "string":
          parameterToReturn.push({
            isExpandable: false,
            location: location,
            pathIsEditableThroughTextField: false,
            parameterName: p.name,
            type: FieldTypeNames.Text
          });
          break;
        case "integer":
          parameterToReturn.push({
            isExpandable: false,
            location: location,
            pathIsEditableThroughTextField: false,
            parameterName: p.name,
            type: FieldTypeNames.Number
          });
          break;
        case "array": {
          // todo: resolve props of array object to show item mapping ui. With this only the array property can be mapped with list in form
          parameterToReturn.push({
            isExpandable: false,
            location: location,
            pathIsEditableThroughTextField: false,
            parameterName: p.name,
            type: FieldTypeNames.List,
            children: [
              {
                isExpandable: true,
                location: location,
                parameterName: "index",
                pathIsEditableThroughTextField: true,
                type: FieldTypeNames.Number
              }
            ]
          });
          break;
        }
        case "object": {
          parameterToReturn.push({
            parameterName: p.name,
            isExpandable: false,
            location: location,
            pathIsEditableThroughTextField: false,
            type: "object"
          });
          break;
        }
        default:
          parameterToReturn.push({
            parameterName: "notSupported",
            isExpandable: false,
            pathIsEditableThroughTextField: false,
            location: location,
            type: "not supported " + p.name + " " + p.type
          });
      }
    }
  }

  return parameterToReturn;
};

export const createOutputParamterForDatasourceTriggers = async (
  knownSwaggerSources: KnownSwaggerDatasource[],
  trigger: DatasourceTriggerConfig[],
  datasources: DataSourceDefinition[],
  sphttp: SPHttpClient,
  currentServerRelativeSharePointUrl: string
): Promise<ParameterV2> => {
  const parameterNodes: ParameterV2[] = [];

  // ❌ Wichtig: NICHT mehr vorab wegfiltern.
  // Regel: gleiche datasourceId + gleicher parameterName => 1 Knoten
  //        gleicher parameterName aber andere datasourceId => 2 Knoten

  const promises = trigger.map(async (t) => {
    try {
      const datasourcesForTrigger = datasources.filter((ds) => {
        return ds.uniqueIdentifier === t.datasourceIdWhichGetsTriggered;
      });

      if (datasourcesForTrigger.length === 1) {
        const datasourceForTrigger = datasourcesForTrigger[0];

        switch (datasourceForTrigger.typeName) {
          case DatasourceTypeNames.SwaggerDatasource: {
            const node = await createoutputParameterTreeNodesFromSwaggerDatasource(knownSwaggerSources, t.parameterName, datasourceForTrigger, sphttp);

            // ✅ metadata für dedupe
            (node as any).__datasourceId = t.datasourceIdWhichGetsTriggered;
            (node as any).__triggerParameterName = t.parameterName;

            parameterNodes.push(node);
            break;
          }

          case DatasourceTypeNames.SharePointDatasource: {
            const params = await createInputOrOutputParameterTreeNodesForSharePointDatasource(datasourceForTrigger.datasourceConfig as SharePointDatasourceConfig, currentServerRelativeSharePointUrl);

            const parameterNode: ParameterV2 = {
              parameterName: t.parameterName, // <- das ist der Name aus dem Actiontrigger
              pathIsEditableThroughTextField: false,
              isExpandable: false,
              location: "",
              type: FieldTypeNames.List,
              children: params
            };

            // ✅ metadata für dedupe
            (parameterNode as any).__datasourceId = t.datasourceIdWhichGetsTriggered;
            (parameterNode as any).__triggerParameterName = t.parameterName;

            parameterNodes.push(parameterNode);
            break;
          }
        }
      }
    } catch (e) {
      log.error("could not map trigger to parameter", { trigger: t, error: e });
    }
  });

  await Promise.all(promises);

  // ✅ Root-dedupe: gleiche Datasource + gleicher Trigger-ParameterName => ein Node
  const deduped = new Map<string, ParameterV2>();
  for (const node of parameterNodes) {
    const datasourceId = (node as any).__datasourceId as string | undefined;
    const key = `${datasourceId ?? "unknown"}::${node.parameterName}`;

    if (!deduped.has(key)) {
      deduped.set(key, node);
    }
  }

  const children = Array.from(deduped.values()).sort((a, b) => {
    const aName = (a.parameterName ?? "").toLowerCase();
    const bName = (b.parameterName ?? "").toLowerCase();
    if (aName < bName) return -1;
    if (aName === bName) return 0;
    return 1;
  });

  return {
    location: "",
    parameterName: "datasources",
    type: "",
    isExpandable: false,
    pathIsEditableThroughTextField: false,
    children
  };
};

export const mapFieldsToParamter = (fields: FieldDescription<FieldValueTypes>[] | FieldDescriptionTypes[]) => {
  const nodesToReturn: ParameterV2[] = [];
  fields = fields.sort((a, b) => {
    var aName = a.internalName.toLowerCase();
    var bName = b.internalName.toLowerCase();
    return aName < bName ? -1 : aName == bName ? 0 : 1;
  });

  fields.forEach((field) => {
    switch (field.type) {
      case FieldTypeNames.User:
      case FieldTypeNames.UserMulti: {
        nodesToReturn.push({
          parameterName: field.internalName,
          location: "",
          type: field.type,
          isExpandable: false,
          pathIsEditableThroughTextField: false,

          children: [
            {
              isExpandable: false,
              location: "",
              parameterName: "0",
              pathIsEditableThroughTextField: true,
              type: FieldTypeNames.Number,

              children: [
                {
                  location: "",
                  parameterName: "title",
                  type: FieldTypeNames.Text,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                },
                {
                  location: "",
                  parameterName: "id",
                  type: FieldTypeNames.Number,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                },
                {
                  location: "",
                  parameterName: "department",
                  type: FieldTypeNames.Text,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                },
                {
                  location: "",
                  parameterName: "email",
                  type: FieldTypeNames.Text,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                }
              ]
            }
          ]
        });
        break;
      }
      case FieldTypeNames.Lookup:
      case FieldTypeNames.LookupMulti: {
        nodesToReturn.push({
          parameterName: field.internalName,
          location: "",
          type: field.type,
          isExpandable: false,
          pathIsEditableThroughTextField: false,
          children: [
            {
              isExpandable: false,
              location: "",
              parameterName: "0",
              pathIsEditableThroughTextField: true,
              type: FieldTypeNames.Number,
              children: [
                {
                  location: "",
                  parameterName: "lookupId",
                  type: FieldTypeNames.Number,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                },
                {
                  location: "",
                  parameterName: "value",
                  type: FieldTypeNames.Text,
                  isExpandable: false,
                  pathIsEditableThroughTextField: false
                }
              ]
            }
          ]
        });
        break;
      }
      case FieldTypeNames.DateTime: {
        nodesToReturn.push({
          location: "",

          type: field.type,
          parameterName: field.internalName,
          isExpandable: false,
          pathIsEditableThroughTextField: false,

          children: [
            {
              location: "",
              parameterName: "time",
              type: FieldTypeNames.DateTime,
              isExpandable: false,
              pathIsEditableThroughTextField: false
            }
          ]
        });
        break;
      }
      case FieldTypeNames.Button:
        nodesToReturn.push({
          parameterName: field.internalName,
          type: field.type,
          location: "",
          isExpandable: false,
          pathIsEditableThroughTextField: false,

          children: [
            {
              location: "",
              parameterName: "label",

              type: FieldTypeNames.Text,
              isExpandable: false,
              pathIsEditableThroughTextField: false
            },
            {
              location: "",
              parameterName: "isDisabled",
              type: FieldTypeNames.Boolean,
              isExpandable: false,
              pathIsEditableThroughTextField: false
            },
            {
              location: "",
              parameterName: "isVisible",
              type: FieldTypeNames.Boolean,
              isExpandable: false,
              pathIsEditableThroughTextField: false
            },
            {
              location: "",
              parameterName: "value",
              type: FieldTypeNames.Text,
              isExpandable: false,
              pathIsEditableThroughTextField: false
            }
          ]
        });
        break;
      case FieldTypeNames.List:
        const listFieldDescription = field as ListFieldDescription;
        const arrayParameter: ParameterV2 = {
          parameterName: field.internalName,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: FieldTypeNames.List,
          children: [
            {
              isExpandable: false,
              location: "",
              parameterName: "0",
              pathIsEditableThroughTextField: true,
              type: FieldTypeNames.Number
            }
          ]
        };
        if (listFieldDescription.itemProperties !== undefined && listFieldDescription.itemProperties.length > 0) {
          arrayParameter.children[0].isExpandable = true;
          arrayParameter.children[0].resolveChildren = () => {
            return mapFieldsToParamter(listFieldDescription.itemProperties);
          };
        }

        nodesToReturn.push(arrayParameter);
        break;
      case FieldTypeNames.Choice:
      case FieldTypeNames.MultiChoice:
        const choiceFieldDescription = field as ChoiceFieldDescription;
        const arrayParameterForChoice: ParameterV2 = {
          parameterName: field.internalName,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: field.type,
          children: [
            {
              isExpandable: false,
              location: "",
              parameterName: "0",
              pathIsEditableThroughTextField: true,
              type: FieldTypeNames.Number
            }
          ]
        };
        if (choiceFieldDescription.fieldValueIsOfTypeTextKeyArray === true) {
          arrayParameterForChoice.children[0].children = [
            {
              isExpandable: false,
              location: "",
              parameterName: "data",
              pathIsEditableThroughTextField: false,
              type: FieldTypeNames.Text
            },
            {
              isExpandable: false,
              location: "",
              parameterName: "key",
              pathIsEditableThroughTextField: false,
              type: FieldTypeNames.Text
            },
            {
              isExpandable: false,
              location: "",
              parameterName: "text",
              pathIsEditableThroughTextField: false,
              type: FieldTypeNames.Text
            }
          ];
        }
        nodesToReturn.push(arrayParameterForChoice);

        break;
      case FieldTypeNames.CustomTemplatedEntity:
        const templatedField = field as CustomTemplatedListFieldDescription;
        const arrayParameterForTemplatedField: ParameterV2 = {
          parameterName: field.internalName,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: FieldTypeNames.List,
          children: [
            {
              isExpandable: false,
              location: "",
              parameterName: "0",
              pathIsEditableThroughTextField: true,
              type: FieldTypeNames.Number
            }
          ]
        };
        if (templatedField.editorModel !== undefined && templatedField.editorModel.customFieldDefinitions !== undefined && templatedField.editorModel.customFieldDefinitions.length > 0) {
          arrayParameterForTemplatedField.children[0].isExpandable = true;
          arrayParameterForTemplatedField.children[0].resolveChildren = () => {
            return mapFieldsToParamter(templatedField.editorModel.customFieldDefinitions);
          };
        }

        nodesToReturn.push(arrayParameterForTemplatedField);
        break;
      default: {
        nodesToReturn.push({
          parameterName: field.internalName,
          type: field.type,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false
        });
      }
    }
  });
  log.debug("created nodefields from FormFields", nodesToReturn);
  return nodesToReturn;
};

export const mapSwaggerPropertiesToParameter = (swaggerJson: any, path: string, properties: any): ParameterV2[] => {
  const fieldsToReturn: ParameterV2[] = [];
  for (const key in properties) {
    const nameInPath = key;
    const pathToUse = path !== "" ? path + "/" + key : key;
    switch (properties[key].type) {
      case undefined:
        if (properties[key].$ref !== undefined) {
          const node = createExpandableReferenceNode(swaggerJson, properties[key].$ref, pathToUse, nameInPath, "");
          fieldsToReturn.push(node);
        } else {
          log.warn("swaggerdatasource, found not supported field at path... " + pathToUse, { path: pathToUse, key: key, object: properties, propertiesOfKey: properties[key] });
          fieldsToReturn.push({
            parameterName: key + " not supported",

            isExpandable: false,
            location: "",
            pathIsEditableThroughTextField: false,
            type: "not supported"
          });
        }
        break;

      case "integer":
        fieldsToReturn.push({
          parameterName: key,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: FieldTypeNames.Number
        });
        break;
      case "string":
        fieldsToReturn.push({
          parameterName: key,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: FieldTypeNames.Text
        });
        break;
      case "array":
        // todo: map array into listfield
        const arrayParameter: ParameterV2 = {
          parameterName: key,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: FieldTypeNames.List
        };
        if (properties[key].items !== undefined) {
          if (properties[key].items.$ref !== undefined) {
            const resolvableIndexNode = createExpandableReferenceNode(swaggerJson, properties[key].items.$ref, "", "index", "");
            resolvableIndexNode.pathIsEditableThroughTextField = true;
            arrayParameter.children = [resolvableIndexNode];
          }
        }

        fieldsToReturn.push(arrayParameter);
        break;
      default:
        fieldsToReturn.push({
          parameterName: nameInPath,
          isExpandable: false,
          location: "",
          pathIsEditableThroughTextField: false,
          type: "not supported"
        });
        log.warn("swaggerdatasource, found not supported field at path... " + pathToUse, { path: pathToUse, key: key, object: properties, propertiesOfKey: properties[key] });
    }
  }

  return fieldsToReturn.sort((a, b) => {
    var aName = a.parameterName.toLowerCase();
    var bName = b.parameterName.toLowerCase();
    return aName < bName ? -1 : aName == bName ? 0 : 1;
  });
};

export const getNodeFromPath = (parameter: ParameterV2[], currentPath: string, pathToFilter: string, pathDelimiter: string): ParameterV2 | undefined => {
  // Sicherstellen, dass pathToFilter mit dem Delimiter beginnt
  if (!pathToFilter.startsWith(pathDelimiter)) {
    pathToFilter = pathDelimiter + pathToFilter;
  }

  // Iteriere durch alle Parameter
  for (let i = 0; i < parameter.length; i++) {
    const parameterPath = currentPath + pathDelimiter + parameter[i].parameterName;

    // Überprüfen, ob der aktuelle Pfad mit pathToFilter übereinstimmt
    if (parameterPath === pathToFilter) {
      return parameter[i];
    }

    // Rekursion, falls Kinder vorhanden sind
    if (parameter[i].children !== undefined && parameter[i].children.length > 0) {
      const result = getNodeFromPath(parameter[i].children, parameterPath, pathToFilter, pathDelimiter);

      // Falls ein passender Knoten gefunden wurde, zurückgeben
      if (result) {
        return result;
      }
    }
  }

  // Falls kein passender Knoten gefunden wurde, undefined zurückgeben
  return undefined;
};

const createInputOrOutputParameterTreeNodesForSharePointDatasource = async (datasource: SharePointDatasourceConfig, currentServerRelativeSharePointUrl: string): Promise<ParameterV2[]> => {
  let urlToUse = datasource.serverRelativeWebUrl;
  if (datasource.searchListInCurrentWeb === true) {
    urlToUse = currentServerRelativeSharePointUrl;
  }
  const fields = await loadFieldSchemaByServerRelativeUrl(urlToUse, datasource.listName);
  const fieldParameter = mapFieldsToParamter(fields);
  var indexNodeWithFieldsAsChildren: ParameterV2 = {
    isExpandable: false,
    location: "",
    parameterName: "0",
    pathIsEditableThroughTextField: true,
    type: FieldTypeNames.Number,
    children: fieldParameter
  };
  return Promise.resolve([indexNodeWithFieldsAsChildren]);
};

const createoutputParameterTreeNodesFromSwaggerDatasource = async (
  knownSwaggerSources: KnownSwaggerDatasource[],
  parameterName: string,
  datasourceDefiniton: DataSourceDefinition,
  spHttpClient: SPHttpClient
): Promise<ParameterV2> => {
  const swaggerConfig = datasourceDefiniton.datasourceConfig as SwaggerDatasourceConfig;
  const matchingSwaggerSource = knownSwaggerSources.filter((ds) => ds.identifier === swaggerConfig.knownSwaggerDatasourceId);
  if (matchingSwaggerSource.length === 0) {
    log.error("no swagger info url is configured for provided id", swaggerConfig, knownSwaggerSources);
    throw new Error("no swagger source found");
  }
  const swaggerInfoUrlToUse = matchingSwaggerSource[0].swaggerInfoUrl;
  const swaggerJson = await loadSwaggerSchema(swaggerInfoUrlToUse, spHttpClient);
  const pathObject = findOperationIdObject(swaggerJson, swaggerConfig.operationId, swaggerConfig.operationType);
  var response = pathObject[swaggerConfig.operationType].responses["200"];
  if (response !== undefined) {
    let schema = undefined;
    if (response.schema !== undefined) {
      schema = response.schema;
    }
    if (response.content !== undefined && response.content["application/json"] !== undefined && response.content["application/json"].schema !== undefined) {
      schema = response.content["application/json"].schema;
    }
    if (schema !== undefined) {
      const fieldDescription = mapSwaggerSchemaToParameterNode(swaggerJson, "", parameterName, schema);
      log.debug("found descriptions from swagger: ", fieldDescription);
      return fieldDescription;
    }
  }
  const defaultParameter: ParameterV2 = {
    parameterName: parameterName,
    isExpandable: false,
    location: "",
    pathIsEditableThroughTextField: false,
    type: "any"
  };
  return defaultParameter;
};

const mapSwaggerSchemaToParameterNode = (swaggerJson: any, path: string, nameInPath: string, itemSchema: any): ParameterV2 => {
  if (itemSchema.$ref !== undefined) {
    var expandableNode = createExpandableReferenceNode(swaggerJson, itemSchema.$ref, path, nameInPath, "");
    return expandableNode;
  }

  if (itemSchema.type === "object") {
  }

  switch (itemSchema.type) {
    case "array":
      var expandableReferenceNode = undefined;
      if (itemSchema.items !== undefined) {
        if (itemSchema.items.$ref !== undefined) {
          const ref = itemSchema.items.$ref;

          expandableReferenceNode = createExpandableReferenceNode(swaggerJson, ref, path, "", "");
        }
      }
      var indexNodeWithFieldsAsChildren: ParameterV2 = {
        isExpandable: false,
        location: "",
        parameterName: "0",
        pathIsEditableThroughTextField: true,
        type: FieldTypeNames.Number,
        children: expandableReferenceNode != undefined ? [expandableReferenceNode] : []
      };
      const node: ParameterV2 = {
        parameterName: nameInPath,
        isExpandable: false,
        location: "",
        pathIsEditableThroughTextField: false,
        type: FieldTypeNames.List,

        children: [indexNodeWithFieldsAsChildren]
      };

      return node;
    case "object":
      const properties = itemSchema.properties;
      const resultForChildren = mapSwaggerPropertiesToParameter(swaggerJson, path, properties);
      const objectNode: ParameterV2 = {
        parameterName: nameInPath,
        isExpandable: false,
        location: "",
        pathIsEditableThroughTextField: false,
        type: "any",

        children: resultForChildren
      };

      return objectNode;
    case "boolean":
      const booleanParameter: ParameterV2 = {
        parameterName: nameInPath,
        isExpandable: false,
        location: "",
        pathIsEditableThroughTextField: false,
        type: FieldTypeNames.Boolean
      };
      return booleanParameter;

    default:
      const defaultParameter: ParameterV2 = {
        parameterName: nameInPath,
        isExpandable: false,
        location: "",
        pathIsEditableThroughTextField: false,
        type: "any"
      };
      return defaultParameter;
  }
};

const createExpandableReferenceNode = (swaggerJson: any, referenceString: string, pathToUse: string, nameInPath: string, location: string): ParameterV2 => {
  const refObject = resolveReference(swaggerJson, referenceString); // object found
  return {
    parameterName: nameInPath,
    isExpandable: true,
    location: location,
    pathIsEditableThroughTextField: false,
    type: "",
    resolveChildren: () => {
      const newFields = mapSwaggerPropertiesToParameter(swaggerJson, pathToUse, refObject.properties);
      return newFields;
      // call vom button rein
    }
  };
};
