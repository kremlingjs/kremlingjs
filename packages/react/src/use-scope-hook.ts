import * as React from "react";
import { defaultNamespace } from "./default-namespace";
import {
  styleTags,
  incrementCounter,
  transformCss,
  KremlingStyleElement,
} from "@kremlingjs/core";
import { CssObj } from "./types";

export function useScope(
  css: string | CssObj,
  overrideNamespace?: string,
): { [key: string]: "" } {
  const isRawCss = typeof css === "string";
  if (!isRawCss && !(css.id && typeof css.styles === "string")) {
    throw Error(
      `Kremling's "useCss" hook requires "id" and "styles" properties when using the kremling-loader`,
    );
  }
  const namespace =
    overrideNamespace || (!isRawCss && css.namespace) || defaultNamespace;

  const [styleElement, setStyleElement] = React.useState(() =>
    getStyleElement(css, namespace),
  );

  React.useLayoutEffect(() => {
    const newStyleElement = getStyleElement(css, namespace);
    setStyleElement(newStyleElement);
    newStyleElement.kremlings++;

    return () => {
      if (--styleElement.kremlings === 0) {
        const rawCss = isRawCss ? css : css.styles;
        document.head.removeChild(styleElement);
        delete styleTags[rawCss];
      }
    };
  }, [css, namespace, isRawCss]);

  return {
    [styleElement.kremlingAttr]: "",
  };
}

function getStyleElement(css: string | CssObj, namespace: string) {
  const isRawCss = typeof css === "string";
  const kremlingAttr = isRawCss
    ? namespace + incrementCounter()
    : namespace + css.id;
  let styleElement: KremlingStyleElement = isRawCss
    ? styleTags[css]
    : styleTags[css.styles];

  if (!styleElement) {
    const kremlingSelector = `[${kremlingAttr}]`;
    const rawCss = isRawCss ? css : css.styles;
    const cssToInsert = isRawCss
      ? transformCss(css, kremlingSelector)
      : css.styles;

    styleElement = document.createElement("style") as KremlingStyleElement;
    styleElement.setAttribute("type", "text/css");
    styleElement.textContent = cssToInsert;
    styleElement.kremlings = 0;
    styleElement.kremlingAttr = kremlingAttr;
    document.head.appendChild(styleElement);

    styleTags[rawCss] = styleElement;
  }

  return styleElement;
}
