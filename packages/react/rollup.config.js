import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";

const extensions = [".ts", ".tsx"];

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/esm/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/cjs/index.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"],
  plugins: [
    typescript(),
    resolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      include: ["src/**/*"],
      exclude: "node_modules/**",
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"],
    }),
    copy({
      targets: [{ src: "src/types.d.ts", dest: ["dist/cjs", "dist/esm"] }],
    }),
  ],
};
