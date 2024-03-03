import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

import { useCss } from "./use-css-hook";
import { resetState, styleTags, KremlingStyleElement } from "@kremlingjs/core";
import { CssObj } from "./types";

let numRenders = 0;

describe("useCss()", () => {
  beforeEach(() => {
    resetState();
    numRenders = 0;
    const styleElements = document.querySelectorAll("style");
    Array.from(styleElements).forEach((styleElement: HTMLStyleElement) => {
      styleElement.remove();
    });
  });

  test("returns the correct props for a dom react element", () => {
    const css = `& .foo {}`;

    render(<ScopedDiv css={css} />);
    expect(screen.getByText("hi")).toHaveAttribute("kremling0");
  });

  test("creates a <style> element when mounting new css, and removes the <style> element when unmounting the component", () => {
    const css = `& .foo {}`;
    const { unmount } = render(<ScopedDiv css={css} />);

    const styleElement = document.querySelector(
      "style",
    ) as KremlingStyleElement;
    expect(styleElement).not.toBeUndefined();
    expect(styleElement.textContent).toEqual(
      `[kremling0] .foo, [kremling0].foo {}`,
    );
    expect(styleElement.isConnected).toBe(true);
    unmount();
    expect(styleElement.isConnected).toBe(false);
  });

  test("reuses an existing style element from a different instance or component", () => {
    const css = `& .foo {}`;
    const existingStyleElement = document.createElement(
      "style",
    ) as KremlingStyleElement;
    existingStyleElement.type = "text/css";
    existingStyleElement.textContent = `[kremling0] .foo, [kremling0].foo {}`;
    existingStyleElement.kremlings = 1;
    existingStyleElement.kremlingAttr = "kremling0";
    document.head.appendChild(existingStyleElement);
    styleTags[css] = existingStyleElement;

    const { unmount } = render(<ScopedDiv css={css} />);
    expect(document.querySelectorAll("style").length).toBe(1);
    expect(document.querySelector("style")).toBe(existingStyleElement);
    expect(screen.getByText("hi")).toHaveAttribute("kremling0");
    // The style element is in the dom
    expect(existingStyleElement.isConnected).toBe(true);
    expect(existingStyleElement.kremlings).toBe(2);
    unmount();
    // The style element is still in the dom because there was a previous thing using it
    expect(existingStyleElement.isConnected).toBe(true);
    expect(existingStyleElement.kremlings).toBe(1);
  });

  test(`doesn't cause the component to render more than once`, () => {
    const css = `& .foo {}`;
    render(<ScopedDiv css={css} />);
    expect(numRenders).toBe(1);
  });

  test(`doesn't do anything weird on subsequent renders`, () => {
    const css = `& .foo {}`;
    const { rerender } = render(<ScopedDiv css={css} />);
    expect(document.querySelectorAll("style").length).toBe(1);
    let styleElement = document.querySelector("style") as KremlingStyleElement;
    expect(styleElement.kremlings).toBe(1);
    expect(styleElement.kremlingAttr).toBe("kremling0");

    // Subsequent render
    rerender(<ScopedDiv css={css} />);
    expect(document.querySelectorAll("style").length).toBe(1);
    styleElement = document.querySelector("style") as KremlingStyleElement;
    expect(styleElement.kremlings).toBe(1);
    expect(styleElement.kremlingAttr).toBe("kremling0");
  });

  test(`allows you to change the dom attribute with a namespace argument`, () => {
    const css = `& .foo {}`;

    render(<ScopedDiv css={css} namespace="yoshi" />);
    expect(screen.getByText("hi")).toHaveAttribute("yoshi0");
  });

  test(`works with preprocessed css`, async () => {
    const preprocessed = {
      id: "15",
      styles: `[donkey-kong15] .foo, [donkey-kong15].foo {}`,
      namespace: "donkey-kong",
    };

    render(<ScopedDiv css={preprocessed} />);
    expect(screen.getByText("hi")).toHaveAttribute("donkey-kong15");
  });

  test(`preprocessed should accept empty style strings`, () => {
    const preprocessed = {
      id: "15",
      styles: ``,
      namespace: "donkey-kong",
    };

    render(<ScopedDiv css={preprocessed} />);
    expect(screen.getByText("hi")).toHaveAttribute("donkey-kong15");
  });

  test(`removes the local styleTag references when the component is unmounted`, () => {
    const preprocessed = {
      id: "8",
      styles: `[star-wars8] .kenobi, [star-wars8].kenobi{}`,
      namespace: "star-wars",
    };

    const { unmount } = render(<ScopedDiv css={preprocessed} />);
    expect(screen.getByText("hi")).toHaveAttribute("star-wars8");
    expect(styleTags[preprocessed.styles]).toBeDefined();
    unmount();
    expect(styleTags[preprocessed.styles]).toBeUndefined();
  });
});

function ScopedDiv(props: { css: string | CssObj; namespace?: string }) {
  const scope = useCss(props.css, props.namespace);

  numRenders++;

  return <div {...scope}>hi</div>;
}
