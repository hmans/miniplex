import { For, Suspense } from "solid-js"
import { A, useLocation } from "solid-start"
import { mods } from "../root"

export function useTableOfContents() {
  const path = useLocation()
  return () => {
    let mod =
      mods[`./routes${path.pathname}.mdx`] ??
      mods[`./routes${path.pathname}.md`]
    if (!mod) return []
    return mod.getHeadings().filter((h) => h.depth > 1 && h.depth <= 3)
  }
}
export default function TableOfContents() {
  const headings = useTableOfContents()
  const location = useLocation()

  return (
    <nav class="toc">
      <h4>On this page:</h4>
      <ul>
        <Suspense>
          <For each={headings()}>
            {(h) => (
              <li>
                <A href={`${location.pathname}#${h.slug}`}>{h.text}</A>
              </li>
            )}
          </For>
        </Suspense>
      </ul>
    </nav>
  )
}
