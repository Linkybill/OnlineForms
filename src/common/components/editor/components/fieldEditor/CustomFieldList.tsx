import { ActionButton, Checkbox, CommandBar, DetailsList, IColumn, IObjectWithKey } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { useMemo, useState, useCallback } from "react";
import { CustomFieldEditor } from "./CustomFieldEditor";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { Guid } from "@microsoft/sp-core-library";
import { loadFieldSchema } from "../../../../listItem/helper/ListHelper";
import { ActionTrigger } from "../../../../actions/models/ActionTrigger";
import { ActionTriggerList } from "../../../../actions/components/ActionTriggerList";
import { FieldPicker } from "../../../picker/components/FieldPicker";
import { ActrionTriggerDragDropProvider } from "../../../../actions/components/ActionTriggerDragDropContext";
import { AddFieldInSharePointLink } from "./AddFieldInSharePointLink";
import { EditorContextConsumer } from "../../../../helper/EditorContext";
import { FieldTypeMapping } from "../../../../../clients/FieldTypeMappings";
import { FieldTypeNumbers } from "../../../../../clients/FieldTypes";

type FieldRow = FieldDescriptionTypes &
  IObjectWithKey & {
    actions: JSX.Element;
    fieldShouldBeSaved: JSX.Element;
    mirrorFieldToSharePoint: JSX.Element;
  };

export const CustomFieldList: React.FC<{
  fields: FieldDescriptionTypes[];
  fieldTriggers: ActionTrigger[];
  onFieldListUpdated: (fields: FieldDescriptionTypes[], saveTemplate: boolean) => void;
  onTriggerListUpdated: (trigger: ActionTrigger[]) => void;
}> = (props): JSX.Element => {
  const [fieldCreatorVisible, setFieldCreatorVisible] = useState(false);
  const [fieldEditorVisible, setFieldEditorVisible] = useState(false);
  const [fieldActionsVisible, setFieldActionsVisible] = useState(false);
  const [useFieldsFromContentTypeVisible, setUseFieldsFromContentTypeVisible] = useState(false);
  const [addFieldInSharePointVisible, setAddFieldInSharePointVisible] = useState(false);

  // welches Feld wird im Editor bearbeitet?
  const [editingFieldInternalName, setEditingFieldInternalName] = useState<string | null>(null);

  // stabiler Filterwert für Feldaktionen
  const [fieldActionsFieldName, setFieldActionsFieldName] = useState<string | null>(null);

  // neu angelegt -> direkt bearbeiten
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | undefined>(undefined);

  const columns: IColumn[] = useMemo(
    () => [
      { key: "displayName", minWidth: 50, maxWidth: 220, isResizable: true, name: "Anzeigename", fieldName: "displayName" },
      { key: "internalName", minWidth: 50, maxWidth: 220, isResizable: true, name: "Name", fieldName: "internalName" },
      { key: "type", minWidth: 50, maxWidth: 70, name: "Feldtyp", fieldName: "type" },
      { key: "saveFieldInItemJSON", minWidth: 120, maxWidth: 120, name: "Feld speichern", fieldName: "fieldShouldBeSaved" },
      { key: "mirrorFieldToSharePoint", minWidth: 120, maxWidth: 120, name: "Feld anheben", fieldName: "mirrorFieldToSharePoint" },
      // Buttons mit Text brauchen Platz -> etwas breiter
      { key: "actions", minWidth: 340, maxWidth: 420, name: "Aktionen", fieldName: "actions" }
    ],
    []
  );

  const sortedFields = useMemo(() => {
    return [...props.fields].sort((a, b) => (a.internalName ?? "").localeCompare(b.internalName ?? "", "de"));
  }, [props.fields]);

  const openEditorForField = useCallback((internalName: string) => {
    setEditingFieldInternalName(internalName);
    setFieldEditorVisible(true);
  }, []);

  const openActionsForField = useCallback((internalName: string) => {
    setFieldActionsFieldName(internalName);
    setFieldActionsVisible(true);
  }, []);

  const deleteField = useCallback(
    (internalName: string) => {
      const fields = props.fields.filter((f) => f.internalName !== internalName);
      props.onFieldListUpdated(fields, false);

      // falls Editor offen war: schließen
      if (editingFieldInternalName === internalName || newlyCreatedKey === internalName) {
        setFieldEditorVisible(false);
        setEditingFieldInternalName(null);
        setNewlyCreatedKey(undefined);
      }

      // falls Feldaktionen offen: schließen
      if (fieldActionsFieldName === internalName) {
        setFieldActionsVisible(false);
        setFieldActionsFieldName(null);
      }
    },
    [props.fields, props.onFieldListUpdated, editingFieldInternalName, newlyCreatedKey, fieldActionsFieldName]
  );

  const items: FieldRow[] = useMemo(() => {
    return sortedFields.map((field) => {
      const hasActions = props.fieldTriggers.some((t) => t.fieldNameWhichTriggersAction === field.internalName);

      return {
        ...field,
        key: field.internalName,

        actions: (
          // ✅ links anbündeln
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ActionButton text={hasActions ? "Feldaktionen (Ja)" : "Feldaktionen (Nein)"} iconProps={{ iconName: hasActions ? "CheckboxComposite" : "Checkbox" }} onClick={() => openActionsForField(field.internalName)} />
            <ActionButton text="Bearbeiten" iconProps={{ iconName: "Edit" }} onClick={() => openEditorForField(field.internalName)} />
            <ActionButton text="Löschen" iconProps={{ iconName: "Delete" }} onClick={() => deleteField(field.internalName)} />
          </div>
        ),

        mirrorFieldToSharePoint: (
          <EditorContextConsumer>
            {(editorContext) => (
              <Checkbox
                checked={editorContext.fieldIsMirrored(field.internalName)}
                disabled={FieldTypeMapping[field.type] === FieldTypeNumbers.Invalid}
                onChange={() => editorContext.toggleMirroredField(field.internalName)}
              />
            )}
          </EditorContextConsumer>
        ),

        fieldShouldBeSaved: (
          <EditorContextConsumer>
            {(editorContext) => <Checkbox checked={editorContext.fieldShouldGetSavedInItemJSON(field.internalName)} onChange={() => editorContext.toggleFieldShouldGetSavedFromItemJSON(field.internalName)} />}
          </EditorContextConsumer>
        )
      };
    });
  }, [sortedFields, props.fieldTriggers, openActionsForField, openEditorForField, deleteField]);

  const editingField = useMemo(() => {
    const key = newlyCreatedKey ?? editingFieldInternalName;
    return key ? props.fields.find((f) => f.internalName === key) : undefined;
  }, [newlyCreatedKey, editingFieldInternalName, props.fields]);

  return (
    <>
      {/* Feld hinzufügen */}
      <ModalWithCloseButton isOpen={fieldCreatorVisible} onClose={() => setFieldCreatorVisible(false)} title="Feld hinzufügen" styles={{ main: { minWidth: 500, width: 800 } }}>
        <CustomFieldEditor
          onTriggerListUpdated={props.onTriggerListUpdated}
          onCloseClicked={() => setFieldCreatorVisible(false)}
          onFieldChanged={(field, saveTemplate) => {
            log.debug("CustomFieldList: FieldChanged", field);

            field.uniqueKey = Guid.newGuid().toString();
            props.onFieldListUpdated([...props.fields, field], saveTemplate);

            setFieldCreatorVisible(false);

            // neu angelegt -> direkt bearbeiten
            setNewlyCreatedKey(field.internalName);
            openEditorForField(field.internalName);
          }}
          value={undefined}
        />
      </ModalWithCloseButton>

      {/* Feld bearbeiten */}
      <ModalWithCloseButton
        isOpen={fieldEditorVisible}
        onClose={() => {
          setFieldEditorVisible(false);
          setEditingFieldInternalName(null);
          setNewlyCreatedKey(undefined);
        }}
        title="Feld bearbeiten"
        styles={{ main: { minWidth: 500, width: 800 } }}>
        <CustomFieldEditor
          onTriggerListUpdated={props.onTriggerListUpdated}
          onCloseClicked={() => setFieldEditorVisible(false)}
          onFieldChanged={(field, saveTemplate) => {
            log.debug("CustomFieldList: FieldChanged", field);

            const oldKey = newlyCreatedKey ?? editingFieldInternalName;
            if (!oldKey) return;

            const idx = props.fields.findIndex((f) => f.internalName === oldKey);
            if (idx < 0) return;

            const fields = [...props.fields];
            fields[idx] = { ...field };
            props.onFieldListUpdated(fields, saveTemplate);

            // falls internalName geändert wurde
            if (field.internalName && field.internalName !== oldKey) {
              setEditingFieldInternalName(field.internalName);
              if (fieldActionsFieldName === oldKey) {
                setFieldActionsFieldName(field.internalName);
              }
            }

            setFieldEditorVisible(false);
            setEditingFieldInternalName(null);
            setNewlyCreatedKey(undefined);
          }}
          value={editingField}
        />
      </ModalWithCloseButton>

      {/* Feldaktionen */}
      {fieldActionsVisible && (
        <ModalWithCloseButton
          isOpen={fieldActionsVisible}
          onClose={() => {
            setFieldActionsVisible(false);
            setFieldActionsFieldName(null);
          }}
          title="Feldaktionen"
          styles={{ main: { minWidth: 500, width: 800 } }}>
          <ActrionTriggerDragDropProvider actionTrigger={props.fieldTriggers} onTriggerChanged={props.onTriggerListUpdated}>
            <ActionTriggerList
              parentContainerId=""
              saveImmediatly={true}
              actionTrigger={props.fieldTriggers}
              filterListOnFieldName={fieldActionsFieldName ?? undefined}
              onTriggerListChanged={props.onTriggerListUpdated}
            />
          </ActrionTriggerDragDropProvider>
        </ModalWithCloseButton>
      )}

      {/* SharePointfelder importieren */}
      <ModalWithCloseButton isOpen={useFieldsFromContentTypeVisible} onClose={() => setUseFieldsFromContentTypeVisible(false)} title="SharePointfelder importieren" styles={{ main: { width: "70%" } }}>
        <FieldPicker
          listId={""}
          webId={""}
          pickedFieldNames={[]}
          onCancelClicked={() => setUseFieldsFromContentTypeVisible(false)}
          onFieldsSelected={async (webId, listId, selectedFieldNames) => {
            const newFields = await loadFieldSchema(webId, listId, undefined);
            const filteredFields: FieldDescriptionTypes[] = newFields.filter((newField) => {
              const gotSelected = selectedFieldNames.indexOf(newField.internalName) !== -1;
              const existingFieldIndex = props.fields.findIndex((propField) => propField.internalName === newField.internalName);
              return existingFieldIndex === -1 && gotSelected === true;
            });

            props.onFieldListUpdated([...props.fields, ...filteredFields], false);
          }}
        />
      </ModalWithCloseButton>

      {/* Feld in SharePoint hinzufügen */}
      <ModalWithCloseButton isOpen={addFieldInSharePointVisible} onClose={() => setAddFieldInSharePointVisible(false)} title="Feld in SharePoint hinzufügen" styles={{ main: { width: "70%" } }}>
        <AddFieldInSharePointLink onCancelClicked={() => setAddFieldInSharePointVisible(false)} />
      </ModalWithCloseButton>

      {/* globale Aktionen */}
      <CommandBar
        items={[
          { text: "Feld hinzufügen", iconProps: { iconName: "Add" }, key: "addField", onClick: () => setFieldCreatorVisible(true) },
          { text: "Felder aus SharePoint importieren", key: "import", onClick: () => setUseFieldsFromContentTypeVisible(true) },
          { text: "Felder in SharePoint hinzufügen", key: "addSP", onClick: () => setAddFieldInSharePointVisible(true) }
        ]}
      />

      <DetailsList columns={columns} items={items} />
    </>
  );
};
