import React, { useEffect, useMemo, useState } from "react";
import { DataSourceDefinition } from "../../models/datasources/DataSourceDefinition";
import { DetailsList, Selection, SelectionMode } from "@fluentui/react";
import log from "loglevel";
import { DataSourceDefinitionEditor } from "./DataSourceDefinitionEditor";
import { createEmptyDatasourceDefinition } from "../../helper/DatasourceHelper";
import { CrudCommandbar } from "../../../components/crudCommandbar/CurdCommandbar";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { useFormConfigurationContext } from "../../../helper/FormConfigurationContext";

export const DataSourcelist = (props: { datasources: DataSourceDefinition[]; onDatasourceListChanged: (datasources: DataSourceDefinition[]) => void }): JSX.Element => {
  log.debug("rendering DatasourceList with ", props);
  const [addFormVisible, setAddFormVisible] = useState<boolean>(false);
  const [editFormVisible, setEditFormVisible] = useState<boolean>(false);

  const currentSelectedItemIds = React.useRef<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const memorisedItems = useMemo(() => {
    return props.datasources.map((ds) => {
      return { ...ds, key: ds.uniqueIdentifier };
    });
  }, [props.datasources.map((d) => JSON.stringify(d)).join(",")]);
  const [selection] = useState<Selection>(
    new Selection({
      onSelectionChanged: async () => {
        log.debug("slection changed in list view", selection.getSelection());
        const selectedItemIdentifiers = selection.getSelection().map((item) => {
          log.debug("mapping item for selection change: ", item);
          return (item as DataSourceDefinition).uniqueIdentifier;
        });

        // this is needed, because:
        // when one component filter another, then the items may change. Item Changing results in a selection changed event.
        // But no selection did change in fact, so we need to check, if the selectedItemIds differe from the last selectedItemIds.
        // if so, we do call the onchange.
        // the check needs to be stored into a ref variable (useRef), because this happens during state change and state change to selectedIds does not have any effect
        // here.
        const newlySelectedItemsComparer = selectedItemIdentifiers.join(",");
        const currentSelectedItemsComparer = currentSelectedItemIds.current.join(",");
        log.debug("check for change in selection", {
          newlySelectedItemsComparer: newlySelectedItemsComparer,
          currentSelectedItemsComparer: currentSelectedItemsComparer
        });

        if (newlySelectedItemsComparer !== currentSelectedItemsComparer) {
          log.debug("datasource list, change in selection detected, setting states", selectedItemIdentifiers, currentSelectedItemIds);
          setSelectedItemIds(selectedItemIdentifiers);
          currentSelectedItemIds.current = selectedItemIdentifiers;
        }
      },
      selectionMode: SelectionMode.multiple
    })
  );

  useEffect(() => {
    selectedItemIds.forEach((itemId) => selection.setKeySelected(itemId, true, false));
  }, [props.datasources.map((d) => JSON.stringify(d)).join(",")]);

  return (
    <>
      <CrudCommandbar
        canAdd={true}
        canDelete={selectedItemIds.length > 0}
        canEdit={selectedItemIds.length > 0}
        onAddClicked={() => setAddFormVisible(true)}
        onDeleteClicked={() => {
          const newDatasources = props.datasources.filter((ds) => selectedItemIds.indexOf(ds.uniqueIdentifier) === -1);
          props.onDatasourceListChanged(newDatasources);
        }}
        onEditClicked={() => {
          setEditFormVisible(true);
        }}></CrudCommandbar>
      <DetailsList
        selection={selection}
        columns={[
          { key: "title", minWidth: 80, name: "Titel", fieldName: "title", maxWidth: 200 },
          { key: "typeName", minWidth: 80, name: "Typ", fieldName: "typeName" }
        ]}
        items={memorisedItems}></DetailsList>
      <>
        {addFormVisible === true && (
          <ModalWithCloseButton styles={{ main: { width: "80%" } }} onClose={() => setAddFormVisible(false)} isOpen={true} title="Datenquelle bearbeiten">
            <DataSourceDefinitionEditor
              onCancelClicked={() => {
                setAddFormVisible(false);
              }}
              onDataSourceDefintionChanged={(newDefinition) => {
                const datasources = [...props.datasources, newDefinition];
                props.onDatasourceListChanged(datasources);
                setAddFormVisible(false);
              }}
              datasourceDefinition={createEmptyDatasourceDefinition("Datasource" + (props.datasources.length > 0 ? props.datasources.length : ""))}
            />
          </ModalWithCloseButton>
        )}
        {editFormVisible === true && (
          <ModalWithCloseButton styles={{ main: { width: "80%" } }} onClose={() => setEditFormVisible(false)} isOpen={true} title="Datenquelle hinzufügen">
            <DataSourceDefinitionEditor
              onCancelClicked={() => {
                setEditFormVisible(false);
              }}
              onDataSourceDefintionChanged={(changedDefintion) => {
                const newDefinitons = [...props.datasources];

                const index = newDefinitons.findIndex((p) => p.uniqueIdentifier === selectedItemIds[0]);
                newDefinitons[index] = changedDefintion;
                log.debug("datsource definition changed: ", { newDefintions: newDefinitons, changedDefinition: changedDefintion, props: props, selectedItemIds: selectedItemIds });

                props.onDatasourceListChanged(newDefinitons);
              }}
              datasourceDefinition={
                props.datasources[
                  props.datasources.findIndex((predicate) => {
                    const match = predicate.uniqueIdentifier === selectedItemIds[0];
                    log.debug("trying to find selected datasource", { predicate: predicate, selectedItemId: selectedItemIds[0], match: match });

                    return match;
                  })
                ]
              }
            />
          </ModalWithCloseButton>
        )}
      </>
    </>
  );
};
