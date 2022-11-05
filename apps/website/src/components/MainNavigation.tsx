import { pipe } from "fp-ts/lib/function"
import { For } from "solid-js"
import { A } from "solid-start"
import { cleanPath, docs, Document } from "~/documents"

type Page = {
  href: string
  title: string
  order: number
  section?: string
}

const toPage = (key: string, doc: Document) => {
  const frontmatter = doc.getFrontMatter()

  return {
    href: cleanPath(key),
    section: frontmatter.section,
    title: frontmatter.title,
    order: frontmatter.order || 0
  }
}

const getPages = () =>
  Object.entries(docs).map(([key, doc]) => toPage(key, doc))

const sortByOrder = (pages: Page[]) => pages.sort((a, b) => a.order - b.order)

export function MainNavigation() {
  const pages = pipe(getPages(), sortByOrder)

  return (
    <nav role="main">
      <ul>
        <For each={pages}>
          {(page) => {
            return (
              <li>
                <A activeClass="current" href={page.href}>
                  {page.title}
                </A>
              </li>
            )
          }}
        </For>
      </ul>
    </nav>
  )
}
