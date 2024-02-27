import React from "react";
import { useScope } from "./use-scope-hook";
import { render, screen, waitFor } from "@testing-library/react";

function TestComponent({ css }: { css: string }) {
  const scope = useScope(css);
  return <div {...scope}>hello world</div>;
}

describe("use-scope", () => {
  test("try things", async () => {
    // const rawCss = "& .test { background: red; }";
    // const processedCss =
    //   "[kremling0] .test, [kremling0].test { background: red; }";
    //
    // render(<TestComponent css={rawCss} />);
    // expect(document.head.querySelector("style")?.textContent).toEqual(
    //   processedCss,
    // );
  });
});
