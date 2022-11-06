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

type Entry = {
  path: string
  title: string
  children?: Entry[]
}

const sections: Entry[] = [
  {
    path: "manual",
    title: "Manual",
    children: [
      {
        path: "introduction",
        title: "Introduction"
      }
    ]
  },
  {
    path: "guides",
    title: "Guides"
  }
]

export function MainNavigation() {
  const pages = getPages()

  return (
    <nav role="main">
      <For each={sections}>
        {({ title, path, children }) => (
          <div>
            <h3>{title}</h3>
            <ul>
              <For each={children}>
                {({ title, path }) => (
                  <li>
                    <A href={path}>{title}</A>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </nav>
  )
}
