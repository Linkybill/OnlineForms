import React from "react";
import { useListItemContext } from "../../../../common/helper/ListItemContext";
import { ActiveListFieldNames } from "../../../../extensions/formTemplateListActions/Constants";

export const WorkflowLink = () => {
  const listItem = useListItemContext();

  if (listItem.getDatasourceResults().spFormItem !== undefined) {
    const spItem = listItem.getDatasourceResults().spFormItem;

    const txtEbene = listItem.getProperty(ActiveListFieldNames.ebene).value;
    const boolIstLeiter = listItem.getProperty(ActiveListFieldNames.istLeiter).value;
    const boolExtranetBetroffen = listItem.getProperty(ActiveListFieldNames.extranet).value;
    const boolProduktionsunterbrechung = listItem.getProperty(ActiveListFieldNames.produktion).value;
    const optAnkuendigung = listItem.getProperty(ActiveListFieldNames.ankuendigung).value;
    const optAnkuendigungAL = listItem.getProperty(ActiveListFieldNames.ankuendigungAl).value;
    const boolUKBW = listItem.getProperty(ActiveListFieldNames.ukbw).value;
    const boolDVUA = listItem.getProperty(ActiveListFieldNames.dvua).value;
    const url =
      listItem.getDatasourceResults().spFormItem !== undefined
        ? "/_layouts/VITA.EFA.WorkflowStatesWebPart/EFAWorkflowStatesGraph.aspx?url=/EFA/UmsetzungIT-MassnahmeV7&params=EbeneMitarbeiter=" +
          txtEbene +
          ",IstLeiter=" +
          boolIstLeiter +
          ",Extranet=" +
          boolExtranetBetroffen +
          ",Produktion=" +
          boolProduktionsunterbrechung +
          ",Ankuendigung=" +
          optAnkuendigung +
          ",AnkuendigungAL=" +
          optAnkuendigungAL +
          ",UKBW=" +
          boolUKBW +
          ",DVUA=" +
          boolDVUA +
          "&id=" +
          listItem.getListItem().ID
        : undefined;
    return (
      <a href={url} style={{ float: "right" }} target="_blank">
        Ablauf anzeigen <img src={require("../../../../../sharepoint/assets/Workflow.png")}></img>
      </a>
    );
  }
  return <></>;
};
