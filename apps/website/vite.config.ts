import solid from "solid-start/vite"
import { defineConfig } from "vite"
import mdx from "solid-start-mdx"

export default defineConfig({
  css: {
    postcss: {
      plugins: []
    }
  },
  plugins: [
    await mdx(),
    solid({
      extensions: [".mdx", ".md"]
      // islands: true,
      // islandsRouter: true
    })
  ]
})
