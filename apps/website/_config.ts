import lume from "lume/mod.ts"
import sass from "lume/plugins/sass.ts"
import metas from "lume/plugins/metas.ts"
import jsx_preact from "lume/plugins/jsx_preact.ts"
import inline from "lume/plugins/inline.ts"
import date from "lume/plugins/date.ts"
import esbuild from "lume/plugins/esbuild.ts"
import code_highlight from "lume/plugins/code_highlight.ts"
import pagefind from "lume/plugins/pagefind.ts"

const site = lume({
  src: "src"
})

site.use(sass())
site.use(metas())
site.use(jsx_preact())
site.use(inline())
site.use(date())
site.use(esbuild())
site.use(code_highlight())
site.use(pagefind())

export default site
