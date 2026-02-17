import { Guid } from "@microsoft/sp-core-library";
import { componentNames } from "../../componentProxy/models/componentNames";
import { IFieldSetProps } from "../../fieldSet/IFieldSetProps";
import { IComponentGridProps } from "../../grid/models/componentGridProps";
import { IRegisterProps } from "../../register/types";
import { IToolpaneCategory } from "../components/Toolbar/Toolbar";
import { IDraggableComponentProps } from "../components/dragDrop/DraggableComponent";
import { AcceptComponent } from "./DragDropAcceptType";
import { TextFieldDescription } from "../../../listItem/fields/textField/TextFieldDescription";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";

export class ToolpaneComponents {
  public static gridComponent: IDraggableComponentProps = {
    componentName: "Tabelle",
    type: AcceptComponent,
    description: "Tabelle",
    iconProps: { iconName: "Table" },
    title: "Tabelle",
    componentConfig: {
      name: componentNames.componentGrid,

      props: {
        uniqueKey: "",
        gridConfig: {
          rows: []
        }
      }
    }
  };

  private static registerProps: IRegisterProps = {
    view: "tabs",
    uniqueKey: "",

    registerConfigs: [
      {
        isVisible: true,

        title: "Register...",
        componentConfig: {
          name: componentNames.componentGrid,
          props: {
            uniqueKey: "",
            gridConfig: {
              rows: []
            }
          }
        }
      }
    ]
  };

  public static register: IDraggableComponentProps = {
    componentName: "Tabbed Register",
    iconProps: { iconName: "TabOneColumn" },
    type: AcceptComponent,
    description: "Register",
    title: "Tabbed Register",
    componentConfig: {
      name: componentNames.register,
      props: ToolpaneComponents.registerProps
    }
  };

  private static accordionProps: IRegisterProps = {
    view: "accordion",
    uniqueKey: "",
    registerConfigs: [
      {
        isVisible: true,
        title: "Register 1",
        componentConfig: {
          name: componentNames.componentGrid,
          props: {
            uniqueKey: "",
            gridConfig: {
              rows: []
            }
          }
        }
      }
    ]
  };

  static accordion: IDraggableComponentProps = {
    componentName: "Accordion",
    iconProps: { iconName: "RowsGroup" },
    type: AcceptComponent,
    description: "Accordion",
    title: "Accordion",
    componentConfig: {
      name: componentNames.register,
      props: ToolpaneComponents.accordionProps
    }
  };

  static htmlComponent: IDraggableComponentProps = {
    componentName: "HTML",
    iconProps: {
      iconName: "FileHTML"
    },
    type: AcceptComponent,
    description: "HTML",
    title: "HTML",
    componentConfig: {
      name: componentNames.html,

      props: {
        listItemForTokenValues: {},
        htmlWithTokens: "",
        tokenEditorSchema: [],
        html: "<h3>HTML bearbeiten</h3>",
        uniqueKey: ""
      }
    }
  };

  static titleFieldForFormTitleInHrml: TextFieldDescription = {
    internalName: "title",
    defaultValue: "",
    description: "",
    displayName: "Formulartitel",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "title",
    isReadOnly: false
  };
  static formTitleComponent: IDraggableComponentProps = {
    componentName: "Titel",
    iconProps: {
      iconName: "FileHTML"
    },
    type: AcceptComponent,
    description: "HTML",
    title: "Formulartitel",
    componentConfig: {
      name: componentNames.html,

      props: {
        listItemForTokenValues: { title: "Title" },
        htmlWithTokens: '<h1 class="customHeadlineOne">{title}</h1>',
        tokenEditorSchema: [ToolpaneComponents.titleFieldForFormTitleInHrml],
        html: '<h1 class="customHeadlineOne">Titel</h1>',
        uniqueKey: ""
      }
    }
  };

  static titleFieldForTitleInHrml: TextFieldDescription = {
    internalName: "title",
    defaultValue: "",
    description: "",
    displayName: "Überschrift",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "title",
    isReadOnly: false
  };

  static iconFieldForTitleInHtml: TextFieldDescription = {
    internalName: "icon",
    defaultValue: "",
    description: "",
    displayName: "Icon",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "title",
    isReadOnly: false
  };
  static titleHtmlComponent: IDraggableComponentProps = {
    componentName: "Titel",
    iconProps: {
      iconName: "FileHTML"
    },
    type: AcceptComponent,
    description: "HTML",
    title: "Überschrift",
    componentConfig: {
      name: componentNames.html,

      props: {
        listItemForTokenValues: { title: "Title" },
        htmlWithTokens: '<h2 class="customHeadlineTwo ms-Icon ms-Icon--{icon}">{title}</h2>',
        tokenEditorSchema: [ToolpaneComponents.titleFieldForTitleInHrml, ToolpaneComponents.iconFieldForTitleInHtml],
        html: '<h2 class="customHeadlineTwo">Titel</h2>',
        uniqueKey: ""
      }
    }
  };

  static fieldSetProps: IFieldSetProps = {
    componentConfig: undefined,
    title: "new fieldset",
    uniqueKey: ""
  };

  static fieldSetComponent: IDraggableComponentProps = {
    componentConfig: {
      name: componentNames.fieldSet,
      props: ToolpaneComponents.fieldSetProps
    },

    componentName: "Gruppierung",
    title: "Gruppierung",
    description: "Gruppierung",
    type: AcceptComponent
  };

  public static sectionComponent: IDraggableComponentProps = {
    componentName: "Bereich",
    type: AcceptComponent,
    description: "Bereich",
    iconProps: { iconName: "Table" },
    title: "Bereich",
    isSection: true,
    componentConfig: {
      isEditorSection: true,
      name: componentNames.componentGrid,

      props: {
        uniqueKey: "",
        gridConfig: {
          rows: [
            {
              cells: [
                {
                  widths: { smWidth: 12 },
                  uniqueIdentifier: "section_" + Guid.newGuid().toString(),
                  componentConfig: {
                    name: componentNames.componentGrid,

                    props: {
                      uniqueKey: "",
                      gridConfig: {
                        rows: []
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };

  public static dividerComponent: IDraggableComponentProps = {
    componentName: "Trennabschnitt",
    type: AcceptComponent,
    description: "Trennabschnitt",
    iconProps: { iconName: "Table" },
    title: "Trennabschnitt",
    isSection: false,
    isDivider: true,
    componentConfig: {
      isDivider: true,
      isEditorSection: false,
      name: componentNames.componentGrid,

      props: {
        uniqueKey: "",
        gridConfig: {
          rows: [
            {
              cells: [
                {
                  widths: { smWidth: 12 },
                  uniqueIdentifier: "section_" + Guid.newGuid().toString(),
                  componentConfig: {
                    name: componentNames.componentGrid,

                    props: {
                      uniqueKey: "",
                      gridConfig: {
                        rows: []
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };

  static componentsCategory: IToolpaneCategory = {
    title: "Komponenten",
    components: [
      ToolpaneComponents.gridComponent,
      ToolpaneComponents.htmlComponent,
      ToolpaneComponents.register,
      ToolpaneComponents.accordion,
      ToolpaneComponents.fieldSetComponent,
      ToolpaneComponents.sectionComponent,
      ToolpaneComponents.dividerComponent,
      ToolpaneComponents.formTitleComponent,
      ToolpaneComponents.titleHtmlComponent
    ]
  };
}
