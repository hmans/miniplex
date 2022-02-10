import { terser } from "rollup-plugin-terser"
import typescript from "rollup-plugin-typescript2"
import pkg from "./package.json"

const defaults = {
  input: "src/index.ts",
  external: ["react"],
  plugins: [
    typescript({
      typescript: require("typescript")
    }),
    terser()
  ]
}

export default [
  {
    ...defaults,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  },
  {
    ...defaults,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  }
]
