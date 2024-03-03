import * as React from "react";
import { defaultNamespace } from "./default-namespace";
import {
  styleTags,
  incrementCounter,
  transformCss,
  KremlingStyleElement,
} from "@kremlingjs/core";
import { CssObj } from "./types";
import { useState } from "react";

export function useCss(
  css: string | CssObj,
  overrideNamespace?: string,
): { [key: string]: "" } {
  const isRawCss = typeof css === "string";
  if (!isRawCss && !(css.id && typeof css.styles === "string")) {
    throw Error(
      `Kremling's "useCss" hook requires "id" and "styles" properties when using the kremling-loader`,
    );
  }

  const [nextCounter] = useState(() => incrementCounter());

  const namespace =
    overrideNamespace || (!isRawCss && css.namespace) || defaultNamespace;
  const kremlingAttr = isRawCss ? namespace + nextCounter : namespace + css.id;

  React.useLayoutEffect(() => {
    const currentStyleElement = getStyleElement(css, kremlingAttr);
    currentStyleElement.kremlings++;
    return () => {
      if (--currentStyleElement.kremlings === 0) {
        const rawCss = isRawCss ? css : css.styles;
        document.head.removeChild(currentStyleElement);
        delete styleTags[rawCss];
      }
    };
  }, [css, kremlingAttr, isRawCss]);

  return {
    [kremlingAttr]: "",
  };
}

function getStyleElement(css: string | CssObj, kremlingAttr: string) {
  const isRawCss = typeof css === "string";
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
