import { terser } from "rollup-plugin-terser"
import typescript from "rollup-plugin-typescript2"
import multiEntry from "rollup-plugin-multi-entry"
import pkg from "./package.json"

const defaults = {
  external: (name) => name =~ /^react\//,
  plugins: [
    multiEntry(),
    typescript({
      typescript: require("typescript")
    }),
    terser()
  ]
}

export default [
  {
    ...defaults,
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  },
  {
    ...defaults,
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  },
  {
    ...defaults,
    input: "src/react.tsx",
    output: {
      file: "dist/react.js",
      format: "cjs",
      sourcemap: true
    }
  },
  {
    ...defaults,
    input: "src/react.tsx",
    output: {
      file: "dist/react.esm.js",
      format: "esm",
      sourcemap: true
    }
  }
]
