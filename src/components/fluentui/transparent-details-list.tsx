import { Fragment } from "react";
import { merge } from "lodash";
import {
  DetailsList,
  DetailsHeader,
  IDetailsListProps,
  DetailsRow,
} from "@fluentui/react/lib/DetailsList";

// the styles prop needs to be explicitly available in the TProps type
// and also compatible with fluentui props that include a style prop
// originally I had used
//
//  extends {
//    styles?: IStyleFunctionOrObject<{ theme: ITheme }, IStyleSet>;
//  }
//
// which worked, but this is more elegant (and works)
const modifyProps = <
  TProps extends {
    styles?: TProps["styles"];
  }
>(
  props: TProps
) => ({
  ...props,
  styles: merge(props.styles, {
    root: {
      background: "transparent",
    },
  }),
});

export default function DetailsListWithBackground(props: IDetailsListProps) {
  modifyProps({ styles: 123 });
  return (
    <DetailsList
      {...props}
      styles={merge(props.styles, {
        root: {
          background: "transparent",
        },
      })}
      onRenderDetailsHeader={(renderProps) => {
        if (!renderProps) {
          return null;
        }

        const modifiedProps = modifyProps(renderProps);

        if (props.onRenderDetailsHeader) {
          return props.onRenderDetailsHeader(modifiedProps);
        }

        return <DetailsHeader {...modifiedProps} />;
      }}
      onRenderRow={(renderProps) => {
        if (!renderProps) {
          return <Fragment />;
        }
        const modifiedProps = modifyProps(renderProps);

        if (props.onRenderRow) {
          return props.onRenderRow(modifiedProps);
        }

        return <DetailsRow {...modifiedProps} />;
      }}
    />
  );
}
