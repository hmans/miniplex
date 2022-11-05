import { For } from "solid-js"
import { A } from "solid-start"
import { cleanPath, docs } from "~/documents"

export function MainNavigation() {
  return (
    <nav role="main">
      <ul>
        <For each={Object.entries(docs)}>
          {([key, doc]) => {
            const frontmatter = doc.getFrontMatter()

            return (
              <li>
                <A activeClass="current" href={cleanPath(key)}>
                  {frontmatter.title}
                </A>
              </li>
            )
          }}
        </For>
      </ul>
    </nav>
  )
}
