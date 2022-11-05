import solid from "solid-start/vite"
import { defineConfig } from "vite"
import mdx from "solid-start-mdx"

export default defineConfig({
  plugins: [
    await mdx(),
    solid({
      extensions: [".mdx", ".md"],
      adapter: "solid-start-static"
    })
  ]
})
