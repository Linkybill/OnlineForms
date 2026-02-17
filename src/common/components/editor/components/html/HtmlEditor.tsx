import log from "loglevel";
import { IHtmlProps } from "../../../htmlComponent/iHtmlProps";
import * as React from "react";
import "react-quill/dist/quill.snow.css";
import { ActionButton } from "@fluentui/react";
import { RichTextEditor } from "./RichTextEditor";
import { componentNames } from "../../../componentProxy/models/componentNames";
import { Html } from "../../../htmlComponent/htmlComponent";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { ListItem } from "../../../../listItem/ListItem";
import { mapObjectToListItem } from "../../../../listItem/mapper/ObjectToListItemMapper";
import { mapListItemToObject } from "../../../../listItem/mapper/ListItemToObjectMapper";
import { EditorContextProvider, EditorContextConsumer } from "../../../../helper/EditorContext";
import { ListItemContextProvider, ListItemContextConsumer } from "../../../../helper/ListItemContext";
import { TemplatedForm } from "../../../formcomponents/components/templatedForm/TemplatedForm";
import { createFormTemplateBasedOnFields } from "../../../../helper/FormTemplateGenerator";
const format: any = require("string-template");

export const HTMLComponentEditor = (props: IHtmlProps): JSX.Element => {
  /*
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */

  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const [value, setValue] = React.useState<string>(props.html);
  var htmlHasSchemaForTokens = props.tokenEditorSchema !== null && props.tokenEditorSchema !== undefined && props.tokenEditorSchema.length > 0;
  var listItem: ListItem = new ListItem(-1);
  var templateToUse = createFormTemplateBasedOnFields(props.tokenEditorSchema !== undefined ? props.tokenEditorSchema : []);

  if (htmlHasSchemaForTokens === true) {
    listItem = mapObjectToListItem(templateToUse.customFieldDefinitions, props.listItemForTokenValues);
  }

  return (
    <>
      {" "}
      {isEditing === true && (
        <ModalWithCloseButton
          title="Bearbeiten"
          isOpen={true}
          onClose={() => {
            setIsEditing(false);
            props.onComponentUpdated({
              name: componentNames.html,
              props: {
                ...props,
                html: value
              }
            });
          }}
          styles={{
            main: {
              width: "100%"
            }
          }}>
          <>
            {htmlHasSchemaForTokens === true && (
              <>
                <EditorContextProvider editorModel={templateToUse} isInEditMode={false}>
                  <EditorContextConsumer>
                    {(editorContext) => {
                      return (
                        <>
                          <ListItemContextProvider
                            onFormClose={() => {
                              setIsEditing(false);
                            }}
                            //listItemHasConflictingChanges={() => false}

                            registeredContainerLockedConditions={templateToUse.containerFieldsAreLockedConditions}
                            registeredContainerHiddenWhenConditions={templateToUse.containerHiddenWhenConditions}
                            onListItemSave={(listItem: ListItem): ListItem => {
                              listItem.ID = 1;
                              const newObject = mapListItemToObject(listItem);
                              var html = format(props.htmlWithTokens !== null ? props.htmlWithTokens : "", newObject);
                              (newObject as any).ID = 1;
                              setValue(html);
                              props.onComponentUpdated({
                                name: componentNames.html,
                                props: {
                                  ...props,
                                  listItemForTokenValues: newObject,
                                  html: html
                                }
                              });

                              return listItem;
                            }}
                            listItem={listItem}>
                            <ListItemContextConsumer>
                              {(listItemContextAccessor) => {
                                return (
                                  <>
                                    <div style={{}}>
                                      <TemplatedForm editMode={true} injectableComponents={[]} template={templateToUse.componentConfig}></TemplatedForm>
                                    </div>
                                  </>
                                );
                              }}
                            </ListItemContextConsumer>
                          </ListItemContextProvider>
                        </>
                      );
                    }}
                  </EditorContextConsumer>
                </EditorContextProvider>
              </>
            )}
            {htmlHasSchemaForTokens !== true && (
              <>
                <RichTextEditor
                  html={value}
                  key={props.uniqueKey}
                  onChange={(newHtml: string) => {
                    setValue(newHtml);
                  }}></RichTextEditor>
              </>
            )}
          </>
        </ModalWithCloseButton>
      )}
      {isEditing === false && (
        <div>
          <ActionButton
            onClick={() => {
              setIsEditing(true);
            }}
            label="Bearbieten"
            text="Bearbeiten"></ActionButton>

          <Html {...props}></Html>
        </div>
      )}
    </>
  );
};
