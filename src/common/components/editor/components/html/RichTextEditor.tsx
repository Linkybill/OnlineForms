import log from "loglevel";
import * as React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ActionButton, ITextField, TextField } from "@fluentui/react";
import { Link } from "./Link";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { LinkEditor } from "./LinkEditor";
import { formatParameterPathToHtmlTemplate } from "./HtmlTemplateHelper";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../ParameterPicker/ParameterPickerV2";
export const RichTextEditor = (props: { key: string; html: string; onChange: (changedVal: string) => void }): JSX.Element => {
  log.debug("rendering cellEditor", props);

  /*
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */

  const [editSource, setEditSource] = React.useState<boolean>(false);
  const [hrefEditorVisible, setHRefEditorVisible] = React.useState<boolean>(false);

  const sourceTextFieldReference = React.useRef<ITextField>(undefined);

  const [parametervisible, setParameterViible] = React.useState<boolean>(false);
  const quillReference = React.useRef<any>(undefined);

  const [selectedLinkDomElement, setSelectedLinkDomElement] = React.useState<undefined | any>(undefined);

  function handleCustomLabel(value) {
    var range = this.quill.getSelection();
    if (range) {
      console.log("range is valid");
      this.quill.format("customLabel", true);
    }
  }

  function handleParameterReference(value) {
    log.debug("handling reference");
    setParameterViible(true);
  }

  function handleCustomHeadlineOne(value) {
    var range = this.quill.getSelection();
    if (range) {
      console.log("range is valid");
      this.quill.format("customHeadlineOne", true);
    }
  }

  function handleCustomHeadlineTwo(value) {
    var range = this.quill.getSelection();
    if (range) {
      console.log("range is valid");
      this.quill.format("customHeadlineTwo", true);
    }
  }

  function handleLink(value) {
    log.debug("quill, handling link", value);

    var range = this.quill.getSelection();
    var [leaf, offset] = this.quill.getLeaf(range.index + 1);
    var domElement = leaf.parent.domNode;
    if (domElement.tagName === "A") {
      setSelectedLinkDomElement(domElement);
    } else {
      setSelectedLinkDomElement(undefined);
    }

    setHRefEditorVisible(true);
    quillReference.current = this.quill;
  }
  function handleCodeEdit(value) {
    log.debug("quill, handling code", value);
    setEditSource((old) => !old);
  }

  var Size = ReactQuill.Quill.import("attributors/style/size");
  Size.whitelist = ["12px", "14px", "16px", "18px", "20px"];
  ReactQuill.Quill.register(Size, true);

  const Font = ReactQuill.Quill.import("attributors/style/font"); // <<<< ReactQuill exports it
  Font.whitelist = ["Arial"]; // allow ONLY these fonts and the default
  ReactQuill.Quill.register(Font, true);

  let Inline = ReactQuill.Quill.import("blots/inline");

  class CustomHeadlineOne extends Inline {
    static create(value) {
      let node = super.create();
      return node;
    }

    static formats(node) {
      return super.formats(node);
    }
  }

  CustomHeadlineOne.blotName = "customHeadlineOne";
  CustomHeadlineOne.tagName = "h1";
  CustomHeadlineOne.className = "customHeadline1";

  ReactQuill.Quill.register({
    "formats/customHeadlineOne": CustomHeadlineOne
  });

  class CustomLabel extends Inline {
    static create(value) {
      let node = super.create();
      return node;
    }

    static formats(node) {
      return super.formats(node);
    }
  }

  CustomLabel.blotName = "customLabel";
  CustomLabel.tagName = "div";
  CustomLabel.className = "customLabel";

  ReactQuill.Quill.register({
    "formats/customLabel": CustomLabel
  });

  class CustomHeadlineTwo extends Inline {
    static create(value) {
      let node = super.create();
      return node;
    }

    static formats(node) {
      return super.formats(node);
    }
  }

  CustomHeadlineTwo.blotName = "customHeadlineTwo";
  CustomHeadlineTwo.tagName = "h2";
  CustomHeadlineTwo.className = "customHeadlineTwo";

  ReactQuill.Quill.register({
    "formats/customHeadlineTwo": CustomHeadlineTwo
  });

  var toolbarOptions = {
    handlers: {
      link: handleLink,
      editCode: handleCodeEdit,
      parameter: handleParameterReference,
      customHeadlineOne: handleCustomHeadlineOne,
      customHeadlineTwo: handleCustomHeadlineTwo,
      customLabel: handleCustomLabel
    },
    container: [
      ["bold", "italic", "underline", "strike", "link"], // toggled buttons
      ["blockquote", "code-block"],
      [{ align: null }, { align: "center" }, { align: "right" }, { align: "justify" }],
      ["image"],
      ["editCode"],
      ["parameter"],
      ["customHeadlineOne"],
      ["customHeadlineTwo"],
      ["customLabel"],
      [{ list: "ordered" }, { list: "bullet" }],

      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction

      [{ size: Size.whitelist }],
      [{ header: [1, 2, false] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: Font.whitelist }],

      ["clean"] // remove formatting button,
    ]
  };

  const memoToolbarOptionsOptions = React.useMemo(() => {
    return toolbarOptions;
  }, [true]);

  const css = `

  .ql-snow{
  .ql-picker{
      &.ql-size{
          .ql-picker-label,
          .ql-picker-item{
              &::before{
                  content: attr(data-value) !important;
              }
          }
      }
  }
}

 .ql-picker{
      &.ql-font{
          .ql-picker-label,
          .ql-picker-item{
              &::before{
                  content: attr(data-value) !important;
              }
          }
      }
  }
}
.ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
  background-color: white !important;
}
    .ql-toolbar {
        top:25px !important;
        background-color: white !important;
        z-index:9999 !important;
        display:block !important;
        height: auto !important;
    }

    div.ql-editor {
        height: 80vh

    }

button.ql-editCode,
button.ql-parameter {
    color:black !important;
}

button.ql-customHeadlineOne,
button.q1-customLabel {
  width:150px !important;
}
button.ql-customHeadlineOne::after {
  content:"Formulartitel";
  color:black !important;    
}

button.ql-customHeadlineTwo {
  width:130px !important;
}
button.ql-customHeadlineTwo::after {
  content:"überschrift";
  color:black !important;    
}
button.ql-editCode::after {
    content:"HTML";
    color:black !important;    
}
button.ql-parameter {
  width:80px !important;
}
button.ql-parameter::after {
    content:"Parameter";
    color:black !important;    
}
button.ql-customLabel::after {
  content:"Label";
  color:black !important;    
}


`;
  return (
    <>
      {editSource === false && (
        <div className={"ql-active"}>
          <style>{css}</style>

          <div className="text-editor">
            <ReactQuill
              modules={{
                toolbar: memoToolbarOptionsOptions
              }}
              onChange={(newValue: string) => {
                props.onChange(newValue);
              }}
              value={props.html}
            />
          </div>
        </div>
      )}
      {hrefEditorVisible === true && (
        <>
          <ModalWithCloseButton
            isOpen={true}
            styles={{
              main: {
                width: "80%"
              }
            }}
            title="Link bearbeiten"
            onClose={() => {
              setHRefEditorVisible(false);
              setSelectedLinkDomElement(undefined);
            }}>
            <LinkEditor
              linkToEdit={
                selectedLinkDomElement === undefined
                  ? { href: "", title: "", target: "_blank" }
                  : { href: selectedLinkDomElement.attributes.href.value, target: selectedLinkDomElement.attributes.target.value, title: selectedLinkDomElement.text }
              }
              onLinkApproved={(val: Link): void => {
                if (selectedLinkDomElement === undefined) {
                  quillReference.current.format("link", val.href);
                } else {
                  selectedLinkDomElement.attributes.href.value = val.href;
                  selectedLinkDomElement.attributes.target.value = val.target;
                  selectedLinkDomElement.text = val.title;
                }
                setHRefEditorVisible(false);
                setSelectedLinkDomElement(undefined);
              }}></LinkEditor>
          </ModalWithCloseButton>
        </>
      )}
      <>
        {editSource === true && (
          <>
            <ActionButton
              onClick={() => {
                setEditSource(false);
              }}
              label="Übernehmen"
              iconProps={{
                iconName: ""
              }}
              text="Übernehmen"></ActionButton>
            <ActionButton
              onClick={() => {
                setParameterViible(true);
              }}
              label="Parameter"
              iconProps={{
                iconName: ""
              }}
              text="Parameter"></ActionButton>

            <TextField
              componentRef={(ref) => {
                sourceTextFieldReference.current = ref;
              }}
              multiline={true}
              rows={50}
              value={props.html}
              onChange={(ev, newText) => {
                props.onChange(newText);
              }}></TextField>
          </>
        )}
        {parametervisible === true && (
          <>
            <ModalWithCloseButton
              title="Parameter einfügen"
              isOpen={true}
              styles={{ main: { width: "80%" } }}
              onClose={() => {
                setParameterViible(false);
              }}>
              <ParameterPickerV2
                pathDelimiter="."
                pathShouldStartWithDelimiter={false}
                parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields}
                onParameterPicked={(path, parameter) => {
                  if (editSource !== true) {
                    var range = quillReference.current.getSelection();
                    const template = formatParameterPathToHtmlTemplate(path);
                    quillReference.current.insertText(range, template);
                  } else {
                    const cursorPos = sourceTextFieldReference.current.selectionStart;

                    const placeHolder = formatParameterPathToHtmlTemplate(path);

                    const newString = props.html.substring(0, cursorPos) + placeHolder + props.html.substring(cursorPos);
                    props.onChange(newString);
                  }
                  setParameterViible(false);
                }}
                selectedPath=""
              />
            </ModalWithCloseButton>
          </>
        )}
      </>
    </>
  );
};
