import log from "loglevel";
import { WithHelpText } from "../../components/helpComponent/withHelpText";
import { useEditorContext } from "../../helper/EditorContext";
import { useFieldsAreLockedInfoContext } from "../../helper/FieldsAreLockedInfoContext";
import { useListItemContext } from "../../helper/ListItemContext";
import { FieldTypeNames, StaticFieldNames } from "../FieldTypeNames";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { FieldValueTypes } from "../types/FieldValueTypes";
import { IFieldProxyProps } from "./FieldProxy";
import { ListPickerField } from "./ListPickerField.tsx/ListPickerField";
import { ListPickerFieldDescription } from "./ListPickerField.tsx/ListPickerFieldDescription";
import { LogicEditorField } from "./LogicEditorField/LogicEditorField";
import { LogicEditorFieldDescription } from "./LogicEditorField/LogicEditorFieldDescription";
import { BooleanField } from "./booleanField/BooleanField";
import { BooleanFieldDescription } from "./booleanField/BooleanFieldDescription";
import { ButtonField, ButtonValue } from "./buttonField/ButtonField";
import { BUttonFieldDescription } from "./buttonField/ButtonFieldDescription";
import { CurrencyField } from "./currencyField/CurrencyField";
import { CurrencyFieldDescription } from "./currencyField/CurrencyFieldDescription";
import { CustomFieldListField } from "./customFieldListField/CustomFieldListField";
import { CustomFieldListFieldDescription } from "./customFieldListField/CustomFieldListFieldDescription";
import { DateTimeField } from "./dateTimeField/DateTimeField";
import { DateTimeFieldDescription } from "./dateTimeField/DateTimeFieldDescription";
import { DropDownField } from "./choiceField/dropdownField/DropDownField";
import { ChoiceFieldDescription, TextKeyChoice } from "./choiceField/ChoiceFieldDescription";
import { DocIconField } from "./fileField/DocIconField";
import { FileField } from "./fileField/FileField";
import { FileFieldDescription } from "./fileField/FileFieldDescription";
import { FileFieldValue } from "./fileField/FileFieldValue";
import { ListField } from "./listField/ListField";
import { ListFieldDescription } from "./listField/ListFieldDescription";
import { StringListField } from "./listField/StringListField";
import { TemplatedListField } from "./listField/TemplatedListField";
import { LookupField } from "./lookupField/LookupField";
import { LookupFieldDescription } from "./lookupField/LookupFieldDescription";
import { NoteField } from "./noteField/NoteField";
import { NoteFieldDescription } from "./noteField/NoteFieldDescription";
import { NumberField } from "./numberField/NumberField";
import { NumberFieldDescription } from "./numberField/NumberFieldDescription";
import { TextFieldDescription } from "./textField/TextFieldDescription";
import { UrlField } from "./urlField/UrlField";
import { UrlFieldDescription } from "./urlField/UrlFieldDescription";
import { UserField } from "./userField/UserField";
import { UserFieldDescription } from "./userField/UserFieldDescription";
import { LookupValue } from "./valueTypes/LookupValue";
import { UrlValue } from "./valueTypes/UrlValue";
import { UserFieldValue } from "./valueTypes/UserFieldValue";
import { WebPickerField } from "./webPickerField/WebPickerField";
import { WebPickerFieldDescription } from "./webPickerField/WebPickerFieldDescription";
import React from "react";
import { TextField } from "./textField/TextField";
import { DateTimeValue } from "./dateTimeField/DateTimeValue";
import { CheckboxField } from "./choiceField/checkBoxField/CheckboxField";
import { RadioField } from "./choiceField/radioField/RadioField";
import { usePermissionContext } from "../../helper/PermissionContext";
import { CustomTemplatedListFieldDescription } from "./customTemplatedListField/CustomTemplatedListFieldDescription";
import { CustomTemplatedListField } from "./customTemplatedListField/CustomTemplatedListField";
import { TemplateEditorField } from "./templateEditorField/TemplateEditorField";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { TemplateEditorFieldDescription } from "./templateEditorField/TemplateEditorFieldDescription";
import { DropDownFieldWithTextKeyChoicesInValue } from "./choiceField/dropdownField/DropDownFieldWithKeyTextValue";
import { CheckboxFieldWithKeyTextValue } from "./choiceField/checkBoxField/CheckboxFieldWithKeyTextValue";
import { RadioFieldWithTextKeyChoiceInValue } from "./choiceField/radioField/RadioFieldWithKeyTextValue";
import { FileUploadField } from "./fileuploadField/FIleUploadField";
import { FileUploadFieldDescription } from "./fileuploadField/FileUploadFieldDescription";
import { FileValue } from "./fileuploadField/FileUploadFieldValue";
import { JSONDataField } from "./jsonDataField/JSONDataField";
import { useServerLoggingContext } from "../../logging/ServerLoggingContext";
import { Logmodel } from "../../logging/LogModel";
import { mapListItemToObject } from "../mapper/ListItemToObjectMapper";

export const CreateField: (props: IFieldProxyProps) => JSX.Element = (props: IFieldProxyProps): JSX.Element => {
  const fieldLockInfo = useFieldsAreLockedInfoContext();
  let fieldIsLocked = props.editMode === false;
  if (fieldLockInfo.fieldsAreLocked === true) {
    fieldIsLocked = true;
  }

  const editorContext = useEditorContext();

  let fieldIsEditable = fieldIsLocked === false;

  const listItemContext = useListItemContext();
  const permissionContext = usePermissionContext();

  const fieldProxyProps: IFieldProxyProps = JSON.parse(JSON.stringify(props));
  const referencedDescription = editorContext.editorModel().customFieldDefinitions.filter((def) => def.internalName === fieldProxyProps.propertyInstance.description.internalName);

  const manipulatedDescription = referencedDescription.length > 0 ? { ...referencedDescription[0] } : { ...fieldProxyProps.propertyInstance.description };

  const serverLoggingContext = useServerLoggingContext();

  const setFieldInfosAndCallPropsOnValChanged = (description: FieldDescriptionTypes, value: FieldValueTypes, validationErrors?: string[]): void => {
    listItemContext.setFieldInfos(description.internalName, value, validationErrors);
    props.onValueChanged(description, value);
    const messageObject: Logmodel = {
      type: "FieldChanged",
      text: "Field " + description.internalName + " changed",
      fieldDescription: description,
      newValue: value,
      oldvalue: listItemContext.getFieldValue(description.internalName),
      listItemContext: mapListItemToObject(listItemContext.getListItem())
    };
    serverLoggingContext.logTrace(messageObject);
  };

  const triggerActionsForield = (description: FieldDescriptionTypes, value: FieldValueTypes, validationErrors?: string[]): void => {
    listItemContext.triggerActionsForField(description);
    //listItemContext.applyValidationRules();
  };

  manipulatedDescription.required = listItemContext.isConditionRequiredFullfilled(manipulatedDescription.internalName, false);

  if (
    manipulatedDescription.isReadOnly !== true && // when field is readonly by nature, it stays readonly
    manipulatedDescription.lockedWhenCondition !== "" &&
    manipulatedDescription.lockedWhenCondition !== undefined
  ) {
    manipulatedDescription.isReadOnly =
      listItemContext.isConditionLockedFullfilled(manipulatedDescription.internalName, manipulatedDescription.isReadOnly !== undefined ? manipulatedDescription.isReadOnly : false) === true;
  } else {
    // no condition defined for readonly, check readonly based on permission, if field is writable
    if (manipulatedDescription.isReadOnly === undefined || manipulatedDescription.isReadOnly === false) {
      if (permissionContext.currentUserCanWrite() === false) {
        manipulatedDescription.isReadOnly = true;
      }
    }
  }

  if (fieldIsEditable === true) {
    fieldIsEditable = manipulatedDescription.isReadOnly === false || manipulatedDescription.isReadOnly === undefined;
  }

  log.debug("createField in FieldProxy for field " + props.propertyInstance.description.internalName + ": ", { props: props, listItemFromContext: listItemContext.getListItem() });

  const createFieldWithManipulatedProps = (): JSX.Element => {
    switch (manipulatedDescription.type) {
      case "Text": {
        return (
          <>
            <TextField
              fieldDescription={manipulatedDescription as TextFieldDescription}
              renderAsTextOnly={props.renderAsTextOnly}
              editMode={fieldIsEditable}
              validationErrors={props.propertyInstance.validationErrors}
              onValueChanged={setFieldInfosAndCallPropsOnValChanged}
              fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
              rawData={props.propertyInstance.rawSharePointData}
              onBlur={triggerActionsForield}></TextField>
          </>
        );
      }

      case "Note": {
        return (
          <NoteField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as NoteFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={setFieldInfosAndCallPropsOnValChanged}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            rawData={props.propertyInstance.rawSharePointData}></NoteField>
        );
      }

      case "Currency": {
        return (
          <CurrencyField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as CurrencyFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={setFieldInfosAndCallPropsOnValChanged}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            rawData={props.propertyInstance.rawSharePointData}></CurrencyField>
        );
      }

      case "Lookup":
      case "LookupMulti": {
        return (
          <LookupField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as LookupFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as LookupValue[]}
            rawData={props.propertyInstance.rawSharePointData}></LookupField>
        );
      }

      case "Number": {
        return (
          <NumberField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as NumberFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={setFieldInfosAndCallPropsOnValChanged}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            rawData={props.propertyInstance.rawSharePointData}></NumberField>
        );
      }

      case "Boolean": {
        return (
          <BooleanField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as BooleanFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as boolean | undefined}
            rawData={props.propertyInstance.rawSharePointData}></BooleanField>
        );
      }

      case "User":
        return (
          <UserField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as UserFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as UserFieldValue[]}
            rawData={props}></UserField>
        );

      case "UserMulti": {
        log.debug("found user field");
        return (
          <UserField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as UserFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as UserFieldValue[]}
            rawData={props.propertyInstance.rawSharePointData}></UserField>
        );
      }

      case "URL": {
        log.debug("found url field");
        return (
          <UrlField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as UrlFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={setFieldInfosAndCallPropsOnValChanged}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as UrlValue | undefined}
            rawData={props.propertyInstance.rawSharePointData}></UrlField>
        );
      }

      case "DateTime": {
        log.debug("found date field");
        return (
          <DateTimeField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as DateTimeFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as DateTimeValue | undefined}
            rawData={props.propertyInstance.rawSharePointData}></DateTimeField>
        );
      }

      case "Choice":
      case "MultiChoice": {
        log.debug("fieldproxy: found choice field", props);
        const choiceDescription = manipulatedDescription as ChoiceFieldDescription;
        if (choiceDescription.representation === undefined || choiceDescription.representation[0] !== "Checkbox / Radio") {
          if (choiceDescription.fieldValueIsOfTypeTextKeyArray !== true) {
            return (
              <DropDownField
                onBlur={() => {}}
                fieldDescription={manipulatedDescription as ChoiceFieldDescription}
                renderAsTextOnly={props.renderAsTextOnly}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string[]}
                rawData={props.propertyInstance.rawSharePointData}></DropDownField>
            );
          } else {
            return (
              <DropDownFieldWithTextKeyChoicesInValue
                onBlur={() => {}}
                fieldDescription={manipulatedDescription as ChoiceFieldDescription}
                renderAsTextOnly={props.renderAsTextOnly}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string[]}
                rawData={props.propertyInstance.rawSharePointData}
              />
            );
          }
        }
        if (choiceDescription.enableMultipleSelections === true) {
          if (choiceDescription.fieldValueIsOfTypeTextKeyArray) {
            return (
              <CheckboxFieldWithKeyTextValue
                onBlur={() => {}}
                fieldDescription={choiceDescription}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                fieldValue={listItemContext.getFieldValue(choiceDescription.internalName) as string[]}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={props.renderAsTextOnly}
              />
            );
          } else
            return (
              <CheckboxField
                onBlur={() => {}}
                fieldDescription={choiceDescription}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                fieldValue={listItemContext.getFieldValue(choiceDescription.internalName) as string[]}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={props.renderAsTextOnly}
              />
            );
        } else {
          if (choiceDescription.fieldValueIsOfTypeTextKeyArray == true) {
            return (
              <RadioFieldWithTextKeyChoiceInValue
                onBlur={() => {}}
                fieldDescription={choiceDescription}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                fieldValue={listItemContext.getFieldValue(choiceDescription.internalName) as string[]}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={props.renderAsTextOnly}
              />
            );
          } else
            return (
              <RadioField
                onBlur={() => {}}
                fieldDescription={choiceDescription}
                editMode={fieldIsEditable}
                validationErrors={props.propertyInstance.validationErrors}
                fieldValue={listItemContext.getFieldValue(choiceDescription.internalName) as string[]}
                onValueChanged={(fielddescription, val) => {
                  setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                  triggerActionsForield(fielddescription, val);
                }}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={props.renderAsTextOnly}
              />
            );
        }
      }

      case "List": {
        log.debug("found list field");
        const listFieldDescription: ListFieldDescription = manipulatedDescription as ListFieldDescription;

        if (listFieldDescription.itemTemplate !== undefined && listFieldDescription.itemTemplate !== "") {
          return (
            <TemplatedListField
              onBlur={() => {}}
              fieldDescription={listFieldDescription}
              renderAsTextOnly={props.renderAsTextOnly}
              editMode={fieldIsEditable}
              validationErrors={props.propertyInstance.validationErrors}
              onValueChanged={() => {}}
              fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as any[]}
              rawData={props.propertyInstance.rawSharePointData}
            />
          );
        }
        return listFieldDescription.itemProperties.length !== 0 ? (
          <ListField
            onBlur={() => {}}
            fieldDescription={listFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as any[]}
            rawData={props.propertyInstance.rawSharePointData}></ListField>
        ) : (
          <StringListField
            onBlur={() => {}}
            editMode={fieldIsEditable}
            fieldDescription={listFieldDescription}
            rawData={props.propertyInstance.rawSharePointData}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string[]}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            renderAsTextOnly={props.renderAsTextOnly}
            validationErrors={props.propertyInstance.validationErrors}></StringListField>
        );
      }
      case FieldTypeNames.Computed: {
        log.debug("rendering supported computed columns", props);
        switch (props.propertyInstance.description.internalName) {
          case StaticFieldNames.LinkFilenameNoMenu:
          case StaticFieldNames.LinkFilename: {
            log.debug("rendering supported computed columns", props);

            return (
              <FileField
                onBlur={() => {}}
                fieldDescription={manipulatedDescription as FileFieldDescription}
                editMode={false}
                fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as FileFieldValue}
                onValueChanged={() => {}}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={true}
                validationErrors={[]}></FileField>
            );
          }
          case StaticFieldNames.DocIcon: {
            log.debug("rendering supported computed columns", props);

            return (
              <DocIconField
                onBlur={() => {}}
                fieldDescription={manipulatedDescription as FileFieldDescription}
                editMode={false}
                fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as FileFieldValue}
                onValueChanged={() => {}}
                rawData={props.propertyInstance.rawSharePointData}
                renderAsTextOnly={true}
                validationErrors={[]}></DocIconField>
            );
          }
        }
      }

      case FieldTypeNames.List: {
        log.debug("found list field");
        const listFieldDescription: ListFieldDescription = props.propertyInstance.description as ListFieldDescription;

        return listFieldDescription.itemProperties.length !== 0 ? (
          <ListField
            onBlur={() => {}}
            fieldDescription={listFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as any[]}
            rawData={props.propertyInstance.rawSharePointData}></ListField>
        ) : (
          <StringListField
            onBlur={() => {}}
            editMode={fieldIsEditable}
            fieldDescription={listFieldDescription}
            rawData={props.propertyInstance.rawSharePointData}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string[]}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            renderAsTextOnly={props.renderAsTextOnly}
            validationErrors={props.propertyInstance.validationErrors}></StringListField>
        );
      }
      case FieldTypeNames.CustomTemplatedEntity: {
        const templatedListDescription: CustomTemplatedListFieldDescription = props.propertyInstance.description as CustomTemplatedListFieldDescription;

        return (
          <CustomTemplatedListField
            onBlur={() => {}}
            fieldDescription={templatedListDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as any[]}
            rawData={props.propertyInstance.rawSharePointData}></CustomTemplatedListField>
        );
      }
      case FieldTypeNames.CustomFieldList: {
        log.debug("FieldProxy, found customfieldlistfield", props);
        return (
          <>
            <CustomFieldListField
              onBlur={() => {}}
              editMode={true}
              fieldDescription={manipulatedDescription as CustomFieldListFieldDescription}
              fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as FieldDescriptionTypes[]}
              rawData={undefined}
              renderAsTextOnly={false}
              validationErrors={[]}
              onValueChanged={(fielddescription, val) => {
                setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
                triggerActionsForield(fielddescription, val);
              }}></CustomFieldListField>
          </>
        );
      }
      case FieldTypeNames.WebPicker: {
        return (
          <WebPickerField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as WebPickerFieldDescription}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            rawData={undefined}
            editMode={props.editMode}
            renderAsTextOnly={false}
            validationErrors={[]}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
          />
        );
      }

      case FieldTypeNames.ListPicker: {
        log.debug("FieldProxy, rendering listpicker " + props.propertyInstance.description.internalName, props);
        return (
          <ListPickerField
            onBlur={() => {}}
            fieldDescription={manipulatedDescription as ListPickerFieldDescription}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            rawData={undefined}
            editMode={props.editMode}
            renderAsTextOnly={false}
            validationErrors={[]}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}></ListPickerField>
        );
      }
      case FieldTypeNames.Button: {
        const buttonsAreDisabled = listItemContext.isButtonDisabled() === true;
        const editModeForButton = buttonsAreDisabled === true ? false : props.editMode;
        return (
          <ButtonField
            onBlur={() => {}}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as ButtonValue}
            fieldDescription={manipulatedDescription as BUttonFieldDescription}
            editMode={editModeForButton}
            rawData={undefined}
            renderAsTextOnly={false}
            validationErrors={[]}
            onValueChanged={(fielddescription, val) => {
              triggerActionsForield(fielddescription, val);
            }}
          />
        );
      }

      case FieldTypeNames.LogicEditor: {
        if (props.renderAsTextOnly === true) {
          const noteFieldDescription: NoteFieldDescription = {
            defaultValue: "",
            description: manipulatedDescription.description,
            fullHtml: false,
            internalName: manipulatedDescription.internalName,
            numberOfLines: 5,
            required: manipulatedDescription.required,
            type: FieldTypeNames.Note,
            uniqueKey: manipulatedDescription.uniqueKey,
            isReadOnly: true,

            displayName: manipulatedDescription.displayName
          };
          return (
            <NoteField
              renderAsTextOnly={true}
              validationErrors={[]}
              rawData={""}
              onBlur={() => {}}
              onValueChanged={() => {}}
              fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
              editMode={false}
              fieldDescription={noteFieldDescription}></NoteField>
          );
        }
        return (
          <LogicEditorField
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as string}
            editMode={true}
            fieldDescription={manipulatedDescription as LogicEditorFieldDescription}
            onBlur={() => {}}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            rawData={""}
            renderAsTextOnly={false}
            validationErrors={[]}></LogicEditorField>
        );
      }
      case FieldTypeNames.FormTemplaeEditor: {
        return (
          <TemplateEditorField
            rawData={""}
            validationErrors={[]}
            renderAsTextOnly={false}
            onBlur={() => {}}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
            }}
            fieldDescription={manipulatedDescription as TemplateEditorFieldDescription}
            editMode={true}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as EditorModel}></TemplateEditorField>
        );
      }
      case FieldTypeNames.FileUpload: {
        return (
          <FileUploadField
            rawData={""}
            validationErrors={[]}
            renderAsTextOnly={false}
            onBlur={() => {}}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldDescription={manipulatedDescription as FileUploadFieldDescription}
            editMode={fieldIsEditable}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as FileValue[]}></FileUploadField>
        );
      }
      case FieldTypeNames.JSONData: {
        return (
          <JSONDataField
            rawData={""}
            validationErrors={[]}
            renderAsTextOnly={false}
            onBlur={() => {}}
            onValueChanged={(fielddescription, val) => {
              setFieldInfosAndCallPropsOnValChanged(fielddescription, val);
              triggerActionsForield(fielddescription, val);
            }}
            fieldDescription={manipulatedDescription as FileUploadFieldDescription}
            editMode={fieldIsEditable}
            fieldValue={listItemContext.getFieldValue(manipulatedDescription.internalName) as any}></JSONDataField>
        );
      }

      default: {
        log.warn("found not supported fieldtype in FieldProxy: ", props.propertyInstance.description);
        return (
          <TextField
            onBlur={triggerActionsForield}
            fieldDescription={manipulatedDescription as TextFieldDescription}
            renderAsTextOnly={props.renderAsTextOnly}
            editMode={fieldIsEditable}
            validationErrors={props.propertyInstance.validationErrors}
            onValueChanged={setFieldInfosAndCallPropsOnValChanged}
            fieldValue="not supported"
            rawData={props.propertyInstance.rawSharePointData}></TextField>
        );
      }
    }
  };

  return (
    <div className={fieldIsEditable === false ? "fieldWrapper locked " + props.propertyInstance.description.type : "fieldWrapper " + props.propertyInstance.description.type}>
      {" "}
      <WithHelpText
        shouldShowHelpText={listItemContext.shouldShowHelptextsOnFields}
        helpText={props.propertyInstance.description.description}
        classIdentifier={props.propertyInstance.description.type}
        title={props.propertyInstance.description.displayName}>
        {createFieldWithManipulatedProps()}
      </WithHelpText>
    </div>
  );
};
