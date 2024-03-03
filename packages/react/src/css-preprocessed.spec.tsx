import React from "react";
import { render } from "@testing-library/react";

import { Css } from "./css";
import { resetState, KremlingStyleElement } from "@kremlingjs/core";
import { CssObj } from "./types";

describe("<Css /> preprocessed", function () {
  beforeEach(() => {
    resetState();
    Array.prototype.slice
      .call(document.querySelectorAll("style"))
      .forEach((styleElement) => {
        styleElement.remove();
      });
  });

  test("should generate and cleanup style tags", function () {
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(0);
    const css = {
      id: "1",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };
    const app = render(
      <Css css={css}>
        <div className="crazy">Okay</div>
      </Css>,
    );
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(1);
    app.unmount();
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(0);
  });

  test("should create a <style> tag with preprocessed styles", function () {
    const css = {
      id: "1",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };
    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );
    expect(document.querySelectorAll("style").length).toBe(1);
    expect(document.querySelector("style")?.textContent).toBe(css.styles);
  });

  test("when webpack updates its styles, component should update the kremling attribute and inner css", function () {
    let css = {
      id: "1",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };
    const Component = ({ kremlingCss }: { kremlingCss: CssObj }) => (
      <div>
        <Css css={kremlingCss}>
          <div>Hello</div>
        </Css>
      </div>
    );

    const { rerender } = render(<Component kremlingCss={css} />);
    expect(document.querySelector("style")?.textContent).toBe(css.styles);

    // update css
    css = {
      id: "2",
      styles: `[kremling2] .someRule, [kremling2].someRule {background-color: green;}`,
    };
    rerender(<Component kremlingCss={css} />);
    expect(document.querySelector("style")?.textContent).toBe(css.styles);
  });

  test("when the user updates its id, component should update <style> kremling attribute", function () {
    let css = {
      id: "1",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };
    const Component = ({ kremlingCss }: { kremlingCss: CssObj }) => (
      <div>
        <Css css={kremlingCss}>
          <div>Hello</div>
        </Css>
      </div>
    );

    const { rerender } = render(<Component kremlingCss={css} />);
    expect(document.querySelector("style")?.textContent).toBe(css.styles);

    // update css
    css = {
      id: "custom-id",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };
    rerender(<Component kremlingCss={css} />);
    expect(document.querySelector("style")?.textContent).toBe(css.styles);
  });

  test(`should increment/decrement <style> kremlings when there's multiples of the same component`, function () {
    const css = {
      id: "1",
      styles: `[kremling1] .someRule, [kremling1].someRule {background-color: red;}`,
    };

    expect(document.head.querySelectorAll("style").length).toBe(0);

    const Component = () => (
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>
    );

    const { rerender, unmount } = render(
      <>
        <Component />
      </>,
    );

    expect(document.head.querySelectorAll("style").length).toBe(1);
    expect(
      (document.head.querySelector("style") as KremlingStyleElement).kremlings,
    ).toBe(1);

    rerender(
      <>
        <Component />
        <Component />
      </>,
    );
    expect(document.head.querySelectorAll("style").length).toBe(1);
    expect(
      (document.head.querySelector("style") as KremlingStyleElement).kremlings,
    ).toBe(2);

    unmount();
    expect(document.head.querySelector("style")).toBe(null);
  });

  test(`shouldn't throw errors when empty css.styles is passed in`, () => {
    const css = { id: "1", styles: "" };
    const Component = ({ kremlingCss }: { kremlingCss: CssObj }) => (
      <div>
        <Css css={kremlingCss}>
          <div>Hello</div>
        </Css>
      </div>
    );
    render(<Component kremlingCss={css} />);
    expect(document.head.querySelector("style")?.innerHTML).toEqual("");
  });
});
