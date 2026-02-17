import { IconButton, mergeStyleSets, FontWeights, Panel } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import * as React from "react";
import { useState } from "react";
import { Grid } from "../grid/grid";
import { Html } from "../htmlComponent/htmlComponent";

export const WithHelpText: React.FC<{
  children?: string | JSX.Element | JSX.Element[] | React.ReactNode | React.ReactNode[];
  iconName?: string;
  shouldShowHelpText: boolean;
  helpText: string;
  title: string;
  classIdentifier: string;
}> = (props) => {
  const targetId = useId("helpTarget");
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  if (props.helpText === "" || props.shouldShowHelpText === false) {
    return <>{props.children}</>;
  }
  return (
    <>
      <Grid
        gridConfig={{
          rows: [
            {
              cells: [
                {
                  uniqueKey: "helpTextCell1",
                  widths: { smWidth: 12 },
                  content: (
                    <>
                      <div className="helpContentContainer">{props.children}</div>
                      <div className={"infoIconContainer containerType_" + props.classIdentifier}>
                        <IconButton
                          className="iconButton"
                          id={targetId}
                          iconProps={{
                            iconName: props.iconName !== undefined ? props.iconName : "Info"
                          }}
                          onClick={() => {
                            setIsHelpVisible(true);
                          }}
                        />
                        {isHelpVisible && (
                          <Panel
                            className="helpTextPanel"
                            headerText={props.title}
                            isOpen={true}
                            title={props.title}
                            isBlocking={false}
                            hasCloseButton={true}
                            onAbort={() => {
                              setIsHelpVisible(false);
                            }}
                            onDismiss={() => {
                              setIsHelpVisible(false);
                            }}>
                            <Html listItemForTokenValues={{}} htmlWithTokens="" html={props.helpText} uniqueKey="help" tokenEditorSchema={[]} />
                          </Panel>
                        )}
                      </div>
                    </>
                  )
                }
              ]
            }
          ]
        }}></Grid>
    </>
  );
};

const styles = mergeStyleSets({
  button: {
    width: 130
  },
  callout: {
    width: 320,
    maxWidth: "90%",
    padding: "20px 24px"
  },
  title: {
    marginBottom: 12,
    fontWeight: FontWeights.semilight
  },
  link: {
    display: "block",
    marginTop: 20
  }
});
