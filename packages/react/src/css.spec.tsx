import React, { useState } from "react";
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { Css } from "./css";
import { resetState } from "@kremlingjs/core";

describe("<Css />", function () {
  beforeEach(() => {
    resetState();
    Array.prototype.slice
      .call(document.querySelectorAll("style"))
      .forEach((styleElement) => {
        styleElement.remove();
      });
  });

  test("should generate and cleanup style tags", function () {
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const { unmount } = render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);

    unmount();
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  test("should dynamically create a style tag with local CSS", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] .someRule, [kremling0].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create local CSS for combined CSS statements & with regular", function () {
    const css = `
      & .someRule, .wow {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] .someRule, [kremling0].someRule, .wow {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create local CSS for combined CSS statements regular with &", function () {
    const css = `
      .wow, & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      .wow, [kremling0] .someRule, [kremling0].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create local CSS for combined CSS statements", function () {
    const css = `
      & .wow, & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] .wow, [kremling0].wow, [kremling0] .someRule, [kremling0].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create local CSS for combined CSS statements and new lines", function () {
    const css = `
      & .wow,
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] .wow, [kremling0].wow, [kremling0] .someRule, [kremling0].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create local CSS multiple css statements", function () {
    const css = `
      & .wow,
      & .someRule {
        background-color: red;
      }

      & .oliver,
      & .cromwell {
        background-color: green;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] .wow, [kremling0].wow, [kremling0] .someRule, [kremling0].someRule {
        background-color: red;
      }

      [kremling0] .oliver, [kremling0].oliver, [kremling0] .cromwell, [kremling0].cromwell {
        background-color: green;
      }
    `.trim(),
    );
  });

  test("should dynamically create a style local CSS for non class/id selector", function () {
    const css = `
      & div {
        background-color: pink;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Ahoy hoy</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll('style[type="text/css"]')[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling0] div, div[kremling0] {
        background-color: pink;
      }
    `.trim(),
    );
  });

  test("should recycle style tags that have the same CSS", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const { unmount } = render(
      <>
        <div>
          <Css css={css}>
            <div>Hello</div>
          </Css>
        </div>
        <div>
          <Css css={css}>
            <div>Hello</div>
          </Css>
        </div>
      </>,
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    unmount();
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  test("should dynamically create a style tag with global CSS", function () {
    const css = `
      .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css}>
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      .someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should create rules with a custom namespace", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css} namespace="kackle">
          <div>Hello</div>
        </Css>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kackle0] .someRule, [kackle0].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  test("should pass through non element children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css} namespace="kackle">
          5
        </Css>
      </div>,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("adds Kremling attribute to React Fragment children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css} namespace="kackle">
          <React.Fragment>
            <div data-testid="greeting">Hello</div>
            <div data-testid="farewell">Bye</div>
          </React.Fragment>
        </Css>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle0");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle0");
  });

  test("adds Kremling attribute to nested React Fragment children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css} namespace="kackle">
          <React.Fragment>
            <React.Fragment>
              <React.Fragment>
                <div data-testid="greeting">Hello</div>
                <div data-testid="farewell">Bye</div>
              </React.Fragment>
            </React.Fragment>
          </React.Fragment>
        </Css>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle0");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle0");
  });

  test("adds Kremling attribute to mixture of React Fragment and DOM Element children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Css css={css} namespace="kackle">
          <React.Fragment>
            <div data-testid="greeting">Hello</div>
            <div data-testid="farewell">Bye</div>
          </React.Fragment>
          <div data-testid="color">Blue</div>
          <React.Fragment>
            <div data-testid="color2">Green</div>
          </React.Fragment>
        </Css>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle0");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle0");
    expect(screen.getByTestId("color")).toHaveAttribute("kackle0");
    expect(screen.getByTestId("color2")).toHaveAttribute("kackle0");
  });

  test("returns null if child is null", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div data-testid="me">
        <Css css={css} namespace="kackle">
          null
        </Css>
      </div>,
    );
    expect(screen.getByTestId("me").innerHTML).toBe("null");
  });

  test("returns null if child is undefined", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div data-testid="me">
        <Css css={css} />
      </div>,
    );
    expect(screen.getByTestId("me").innerHTML).toEqual("");
  });

  test("should properly work with dynamically changing css props", async () => {
    const user = userEvent.setup();
    const Counter = ({ id }: { id: string }) => {
      const [width, setWidth] = useState(100);
      return (
        <Css
          css={`
            & .someRule {
              width: ${width}%;
            }
          `}
        >
          <button onClick={() => setWidth(width + 10)}>{id}</button>
        </Css>
      );
    };

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);

    const { unmount } = render(
      <div>
        <Counter id="one" />
        <Counter id="two" />
        <Counter id="three" />
      </div>,
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    user.click(screen.getByRole("button", { name: "one" }));
    user.click(screen.getByRole("button", { name: "one" }));
    user.click(screen.getByRole("button", { name: "two" }));

    await waitFor(() =>
      expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(
        2,
      ),
    );

    unmount();

    expect(
      await waitFor(
        () => document.querySelectorAll(`style[type="text/css"]`).length,
      ),
    ).toBe(0);
  });
});
