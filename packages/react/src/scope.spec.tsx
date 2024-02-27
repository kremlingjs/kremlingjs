import React from "react";
import { Scope } from "./scope";
import { render, screen } from "@testing-library/react";

describe("<Scope>", () => {
  test("thing", () => {
    const rawCss = "& .test { background: red; }";
    const processedCss =
      "[kremling0] .test, [kremling0].test { background: red; }";

    render(
      <Scope css={rawCss}>
        <div>sup</div>
      </Scope>,
    );
  });
});
