import { For, Suspense } from "solid-js"
import { A, useLocation } from "solid-start"
import { createServerData$ } from "solid-start/server"
import { mods } from "../root"

export function useTableOfContents() {
  const path = useLocation()
  return createServerData$(
    async (pathname) => {
      let mod =
        mods[`./routes${pathname}.mdx`] ?? mods[`./routes${pathname}.md`]
      if (!mod) return []
      return mod.getHeadings().filter((h) => h.depth > 1 && h.depth <= 3)
    },
    {
      key: () => path.pathname
    }
  )
}

export default function TableOfContents() {
  const headings = useTableOfContents()

  return (
    <nav class="toc">
      <h4>On this page:</h4>
      <ul>
        <Suspense>
          <For each={headings()}>
            {(h) => (
              <li>
                <A href={`#${h.slug}`}>{h.text}</A>
              </li>
            )}
          </For>
        </Suspense>
      </ul>
    </nav>
  )
}
