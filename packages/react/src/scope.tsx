import * as React from "react";

import { useScope } from "./use-scope-hook";
import { CssObj } from "./types";

export type CssProps = {
  css: string | CssObj;
  namespace?: string;
  children?: React.ReactNode;
};

export function Scope(props: CssProps) {
  const { css, children, namespace } = props;

  React.useEffect(() => {
    if (
      typeof css !== "string" &&
      (!css?.id || typeof css?.styles !== "string")
    ) {
      throw Error(
        `Kremling's <Scoped /> component requires either a "string" or a "cssObj" (eg: { id: string; styles: string; }).`,
      );
    } else if (typeof css !== "string") {
      throw Error(`Kremling's <Scoped /> component requires the "css" prop.`);
    }
  }, []);

  const scope = useScope(css, namespace);
  const kremlingAttr = React.useMemo(() => {
    return Object.keys(scope)[0];
  }, [scope]);

  const addKremlingAttributeToChildren = (
    nextChildren: React.ReactNode,
    kremlingAttr: string,
  ): React.ReactNode => {
    return React.Children.map(nextChildren, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === React.Fragment) {
          const fragmentChildren = addKremlingAttributeToChildren(
            child.props.children,
            kremlingAttr,
          );
          return React.cloneElement(child, {}, fragmentChildren);
        } else {
          return React.cloneElement(child, {
            [kremlingAttr]: "",
          });
        }
      } else {
        return child;
      }
    });
  };

  if (
    children === undefined ||
    children === null ||
    children === false ||
    children === true
  ) {
    return null;
  }

  return React.useMemo(
    () => addKremlingAttributeToChildren(children, kremlingAttr),
    [children, kremlingAttr],
  );
}
