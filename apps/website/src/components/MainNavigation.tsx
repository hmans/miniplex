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
      },
      {
        path: "installation",
        title: "Installation"
      },
      {
        path: "basic-usage",
        title: "Basic Usage"
      },
      {
        path: "advanced-usage",
        title: "Advanced Usage"
      },
      {
        path: "best-practices",
        title: "Best Practices"
      }
    ]
  },
  {
    path: "guides",
    title: "Guides",
    children: [
      {
        path: "performance",
        title: "Performance"
      }
    ]
  }
]

function NavigationList({
  entries,
  prefix = "/"
}: {
  entries: Entry[]
  prefix?: string
}) {
  return (
    <ul>
      <For each={entries}>
        {(entry) => {
          const url = prefix + entry.path
          return (
            <li>
              <A href={url}>{entry.title}</A>

              {entry.children && (
                <NavigationList entries={entry.children} prefix={`${url}/`} />
              )}
            </li>
          )
        }}
      </For>
    </ul>
  )
}

export function MainNavigation() {
  return (
    <nav role="main">
      <NavigationList entries={sections} />
    </nav>
  )
}
