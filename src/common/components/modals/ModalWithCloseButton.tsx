import { IButtonStyles, IconButton, IIconProps, IModalStyleProps, IModalStyles, IStyleFunctionOrObject, mergeStyleSets, Modal } from "@fluentui/react";
import * as React from "react";

export const ModalWithCloseButton: React.FC<{
  title: string;
  isOpen: boolean;
  onClose: () => void;
  styles?: IStyleFunctionOrObject<IModalStyleProps, IModalStyles>;
  className?: string;
  children: JSX.Element | JSX.Element[];
}> = (props): JSX.Element => {
  const cancelIcon: IIconProps = { iconName: "Cancel" };

  return (
    <>
      <Modal className={props.className} styles={props.styles} isBlocking={true} isOpen={props.isOpen === true} onDismiss={() => props.onClose()} containerClassName={contentStyles.container}>
        <div style={{ padding: 20 }}>
          <div className={contentStyles.header}>
            <div className={"modalTitle"}>{props.title}</div>
            <IconButton
              iconProps={cancelIcon}
              styles={iconButtonStyles}
              ariaLabel="Close popup modal"
              onClick={() => {
                props.onClose();
              }}
            />
          </div>
          {props.children}
        </div>
      </Modal>
    </>
  );
};

const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: "gray",
    marginLeft: "auto",
    marginTop: "4px",
    marginRight: "2px"
  },
  rootHovered: {
    color: "gray"
  }
};

const contentStyles = mergeStyleSets({
  container: {
    display: "flex",
    flexFlow: "column nowrap",
    alignItems: "stretch"
  },
  header: [
    {
      flex: "1 1 auto",
      color: "gray",
      display: "flex",
      alignItems: "center",
      padding: "12px 12px 14px 24px"
    }
  ]
});
