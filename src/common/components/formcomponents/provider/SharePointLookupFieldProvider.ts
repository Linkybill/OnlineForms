import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import log from "loglevel";
import { ILookupFieldProvider } from "../interfaces/ILookupFieldProvider";

export class SharePointLookupFieldProvider implements ILookupFieldProvider {
  async loadDisplayFormUrl(webId: string, listId: string, itemId: number): Promise<string> {
    const lookupWeb = await (await sp.site.openWebById(webId)).web.get();

    log.debug("opened web", lookupWeb);
    const lookupList = await Web(lookupWeb.Url).lists.getById(listId).get();

    log.debug("found lookuplist", lookupList);
    const redirectUrl = lookupWeb.Url + "/lists/" + lookupList.Title + "/dispform.aspx?ID=" + itemId;
    log.debug("loaded redirect url for details form", redirectUrl);
    return redirectUrl;
  }
  loadLookupValues(webId: string, listId: string, lookupFieldName: string, filterValue: string): Promise<any[]> {
    return this.getFilterData(lookupFieldName, filterValue, webId, listId);
  }

  private async getFilterData(lookupFieldName: string, filterValue: string, webId: string, listId: string): Promise<any[]> {
    log.debug("going to load filter data from sharePoint", lookupFieldName, filterValue);
    // todo: get lookup field type somehow
    const view: string = this.createViewXml(lookupFieldName, filterValue, "Text");

    const items = await this.loadItemsFromXmlView(view, webId, listId);
    log.debug("loaded filter data from sharePoint", items);

    return items;
  }

  createViewXml(fieldName: string, filterValue: string, fieldType: string): string {
    const view =
      '<View Type="HTML" Level="1" BaseViewID="1"><Query><Where><Contains><FieldRef Name="' +
      fieldName +
      '"/><Value Type="' +
      fieldType +
      '">' +
      filterValue +
      '</Value></Contains></Where></Query><ViewFields><FieldRef Name="' +
      fieldName +
      '" /></ViewFields><RowLimit Paged="TRUE">30</RowLimit></View>';
    return view;
  }
  private async loadItemsFromXmlView(viewWithFilter: string, webId: string, listId: string): Promise<any[]> {
    const web = await sp.site.openWebById(webId);
    const list = web.web.lists.getById(listId);

    const result = await list.renderListDataAsStream(
      {
        ViewXml: viewWithFilter,
        DatesInUtc: true
      },
      undefined
    );

    return result.Row;
  }
}
