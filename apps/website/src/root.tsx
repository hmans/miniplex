// @refresh reload
import { createMemo, For, Show, Suspense } from "solid-js"
import { MDXProvider } from "solid-mdx"
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
  unstable_island
} from "solid-start"
import { ErrorBoundary } from "solid-start/error-boundary"
import "./resources/styles.css"

const IslandA = unstable_island(() => import("./components/A"))
const TableOfContents = unstable_island(
  () => import("./components/TableOfContents")
)

type SolidStartFunctions = {
  getHeadings: () => {
    depth: number
    text: string
    slug: string
  }[]
  getFrontMatter: () => {
    title?: string
    sectionTitle?: string
    order?: number
    section?: string
    sectionOrder?: number
    subsection?: string
  }
}

export const mods = import.meta.glob<true, any, SolidStartFunctions>(
  "./routes/**/*.{md,mdx}",
  { eager: true, query: { meta: "" } }
)

function Header() {
  return (
    <header>
      <div>The Book of Miniplex</div>
      <div>
        <a href="https://miniplex.hmans.co/" target="_blank">
          miniplex.hmans.co
        </a>
      </div>
    </header>
  )
}

type Sections = {
  [key: string]: {
    title: string
    path: string
    order: number
    subsection: string
    href: string
    frontMatter: Record<string, any>
  }[] & {
    subsection?: Set<string>
    title?: string
    order?: number
  }
}

function MainNavigation() {
  const data = createMemo(() => {
    let sections: Sections = {}

    Object.keys(mods).forEach((key) => {
      let frontMatter = mods[key].getFrontMatter()
      let {
        title = mods[key].getHeadings().find((h) => h.depth === 1)?.text ?? "",
        section = "",
        order = 100
      } = frontMatter ?? {}
      if (!sections[section]) {
        sections[section] = []
      }

      if (frontMatter?.subsection) {
        if (!sections[section].subsection) {
          sections[section].subsection = new Set()
        }
        sections[section].subsection.add(frontMatter.subsection)
      }

      if (frontMatter?.sectionTitle) {
        sections[section].title = frontMatter.sectionTitle
      }

      if (frontMatter?.sectionOrder) {
        sections[section].order = frontMatter.sectionOrder
      }

      sections[section].push({
        title,
        path: key,
        order,
        frontMatter,
        subsection: frontMatter?.subsection,
        href: key.slice("./routes".length).replace(/\.mdx?$/, "")
      })
    })

    Object.keys(sections).forEach((key) => {
      sections[key].sort((a, b) => a.order - b.order)
    })

    return Object.values(sections).sort(
      (a, b) => (a.order ?? 100) - (b.order ?? 100)
    )
  })

  return (
    <nav>
      <For each={data()}>
        {(r) => (
          <ul>
            {r.title}
            <Show
              when={!r.subsection}
              fallback={
                <>
                  <For each={[...r.subsection.values()]}>
                    {(s) => (
                      <ul>
                        <div>{s}</div>
                        <For each={r.filter((i) => i.subsection === s)}>
                          {({ title, path, href, frontMatter }) => (
                            <li>
                              <IslandA
                                activeClass="text-primary"
                                inactiveClass="text-gray-500"
                                href={href}
                              >
                                {title}
                              </IslandA>
                            </li>
                          )}
                        </For>
                      </ul>
                    )}
                  </For>

                  <For each={r.filter((i) => !i.subsection)}>
                    {({ title, path, href, frontMatter }) => (
                      <li>
                        <IslandA
                          activeClass="text-primary"
                          inactiveClass="text-gray-500"
                          href={href}
                        >
                          <span>{title}</span>
                        </IslandA>
                      </li>
                    )}
                  </For>
                </>
              }
            >
              <For each={r}>
                {({ title, path, href, frontMatter }) => (
                  <li>
                    <IslandA
                      activeClass="text-primary"
                      inactiveClass="text-gray-500"
                      href={href}
                    >
                      {title}
                    </IslandA>
                  </li>
                )}
              </For>
            </Show>
          </ul>
        )}
      </For>
    </nav>
  )
}

import { components } from "./components/components"
import { useTableOfContents } from "./components/TableOfContents"

function PageContent() {
  return (
    <MDXProvider
      components={{
        ...components,
        "table-of-contents": () => {
          const headings = useTableOfContents()
          return (
            <>
              <div>
                <ul>
                  <Suspense>
                    <For each={headings()}>
                      {(h) => (
                        <li>
                          <IslandA href={`#${h.slug}`}>{h.text}</IslandA>
                        </li>
                      )}
                    </For>
                  </Suspense>
                </ul>
              </div>
              <hr />
            </>
          )
        }
      }}
    >
      <Routes>
        <FileRoutes />
      </Routes>
    </MDXProvider>
  )
}

export default function Root() {
  return (
    <Html lang="en">
      <Title>The Book of Miniplex</Title>
      <Head>
        <Meta charset="utf-8" />
        <Meta property="og:title" content="The Book of Miniplex" />
        <Meta property="og:site_name" content="The Book of Miniplex" />
        <Meta property="og:url" content="https://miniplex.hmans.co/" />
        <Meta property="og:description" content="" />
        <Meta property="og:type" content="website" />
        <Meta property="og:image" content="" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta name="description" property="og:description" content="" />
        <Meta name="author" content="@hmans" />

        <Link rel="icon" href="/favicon.ico" />
      </Head>

      <Body>
        <Header />

        <MainNavigation />

        <div>
          <div>
            <ErrorBoundary>
              <Suspense>
                <main>
                  <PageContent />
                </main>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        <TableOfContents />
        <Scripts />
      </Body>
    </Html>
  )
}
