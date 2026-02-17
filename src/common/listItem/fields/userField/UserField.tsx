import { useState } from "react";
import { CompactPeoplePicker, IPersonaProps, Label } from "@fluentui/react";
import log from "loglevel";
import { IUserFieldComponentProps } from "./UserFieldComponentProps";
import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import { UserFieldValue } from "../valueTypes/UserFieldValue";
import { FieldUserRenderer, IPrincipal } from "@pnp/spfx-controls-react";
import { useComponentContext } from "../../../helper/CurrentWebPartContext";
import * as React from "react";
import { managerFactory } from "../../../components/formcomponents/manager/createManager";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";

export const UserField = (props: IUserFieldComponentProps): JSX.Element => {
  const [error, setError] = useState<string | undefined>(undefined);
  const componentContext = useComponentContext();
  log.debug("webPartContext in userField", componentContext);
  log.debug("rendering UserField ... " + props.fieldDescription.internalName + " with props", { props: props, context: componentContext });
  const ensureUsersToBeResolved = async (itemsToResolve: IPersonaProps[]) => {
    const resolvedProps = itemsToResolve.map(async (item): Promise<UserFieldValue> => {
      const itemIsResolved = (item.itemID as string).indexOf("membership") >= 0;
      if (itemIsResolved) {
        return {
          title: item.text ? item.text : "no text",
          id: item.itemID ? (item.itemID as string) : "",
          department: "",
          email: "",
          jobTitle: "",
          picture: "",
          sip: ""
        };
      } else {
        const results = await onFilterChanged(item.text ? item.text : "");

        log.debug("trying to resolve from ", results, "with title ", item.text);

        const resolvedMatch = results.find((result) => result.itemID === item.itemID);
        log.debug("found resolved match: ", resolvedMatch);

        if (resolvedMatch !== undefined) {
          return {
            title: resolvedMatch.text ? resolvedMatch.text : "no text",
            id: resolvedMatch.itemID ? (resolvedMatch.itemID as string) : "",
            department: "",
            email: "",
            jobTitle: "",
            picture: "",
            sip: ""
          };
        }
        throw new Error("could not resolve user for update");
      }
    });

    const promiseResolvedItems = await Promise.all(resolvedProps);
    props.onValueChanged(props.fieldDescription, promiseResolvedItems);
  };
  if (props.renderAsTextOnly) {
    if (props.renderAsTextOnly) {
      if (props.fieldValue !== undefined && props.fieldValue.length > 0) {
        const mapUsersToIPrincipals = (fieldValue: UserFieldValue[]): IPrincipal[] => {
          const mappedUsers = props.fieldValue.map((user): IPrincipal => {
            return {
              department: user.department,
              email: user.email,
              id: user.id,
              jobTitle: user.jobTitle,
              picture: user.picture,
              sip: user.sip,
              title: user.title,
              value: "value??"
            };
          });
          return mappedUsers;
        };
        return (
          <FieldUserRenderer
            context={{
              pageContext: componentContext.context.pageContext as any,
              spHttpClient: componentContext.spHttpClient as any
            }}
            users={mapUsersToIPrincipals(props.fieldValue)}></FieldUserRenderer>
        );
      }
    }
    return <></>;
  }
  const selectedUsers: IPersonaProps[] =
    props.fieldValue === undefined
      ? []
      : props.fieldValue.map((initialVal): IPersonaProps => {
          return {
            key: initialVal.id,
            itemID: initialVal.id,
            text: initialVal.title
          };
        });

  const mapPeoplePickerEntityToPersonaProp = (entity: IPeoplePickerEntity): IPersonaProps => {
    return {
      text: entity.DisplayText,
      itemID: entity.Key
    };
  };

  const onFilterChanged = async (filterText: string): Promise<IPersonaProps[]> => {
    const manager = managerFactory.createUserFieldManager();
    const result = await manager.searchPeople(filterText, props.fieldDescription.allowGroupSelection, props.fieldDescription.groupId);

    if (result.error !== undefined) {
      setError(result.error);
      return Promise.resolve([]);
    }
    return result.model.map((entity): IPersonaProps => mapPeoplePickerEntityToPersonaProp(entity));
  };

  log.debug("rendering multiUserField " + props.fieldDescription.internalName + " with ", {
    props: props,
    selectedUsersAsPersonaProps: selectedUsers,
    fieldDescription: props.fieldDescription
  });

  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName}></LabelWithRequiredInfo>
      <CompactPeoplePicker
        selectedItems={selectedUsers}
        onResolveSuggestions={onFilterChanged}
        onChange={(items) => {
          // todo make this better somehow?
          // problem: initially loaded users do not have their membership in id. But this is nessesary to make sharepoint update work.
          // therefore i need to try to find a criteria, with which i can recorgnize, if i should load information or not.
          // Possible workflows for this can be:
          // 1. check, if the id string contains membership
          // 2. find old values somehow... but i guess this is not effective, due to the fact, that users can also be removed. Dont know how to detect, which item is newly added.

          // I decide, to check if the id contains membership. If not, i will try to reload it.

          // this could be a function inside the manager, but for now it is suitable just here for testing and proof of concept.

          log.debug("multiuserField triggered onchange ", items);
          ensureUsersToBeResolved(items !== undefined ? items : []);
        }}
        className={"ms-PeoplePicker"}
        selectionAriaLabel={"Selected contacts"}
        removeButtonAriaLabel={"Remove"}
        pickerSuggestionsProps={{
          searchingText: "loading users",
          loadingText: "loading users",
          noResultsFoundText: "no users found"
        }}
        disabled={props.editMode === false}
        itemLimit={props.fieldDescription.canSelectMultipleItems ? undefined : 1}
      />
    </WithErrorsBottom>
  );
};
