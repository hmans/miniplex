// @refresh reload
import { For, Suspense } from "solid-js"
import { MDXProvider } from "solid-mdx"
import {
  A,
  Body,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title
} from "solid-start"
import { ErrorBoundary } from "solid-start/error-boundary"
import { components } from "./components/components"
import { MainNavigation } from "./components/MainNavigation"
import TableOfContents, {
  useTableOfContents
} from "./components/TableOfContents"
import "./css/styles.scss"

function PageHeader() {
  return (
    <header role="main">
      <div class="title">The Book of Miniplex</div>
      {/* <div>
        <a href="https://miniplex.hmans.co/" target="_blank">
          miniplex.hmans.co
        </a>
      </div> */}
    </header>
  )
}

function PageContent() {
  return (
    <MDXProvider
      components={{
        ...components,
        "table-of-contents": () => {
          const headings = useTableOfContents()
          return (
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

function DocumentHead() {
  return (
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
  )
}

export default function Root() {
  return (
    <Html lang="en">
      <Title>The Book of Miniplex</Title>
      <DocumentHead />

      <Body>
        <PageHeader />

        <section role="main">
          <div class="sidebar sidebar-left">
            <div class="sidebar-contents">
              <MainNavigation />
            </div>
          </div>

          <main>
            <ErrorBoundary>
              <Suspense>
                <PageContent />
              </Suspense>
            </ErrorBoundary>
          </main>

          <div class="sidebar sidebar-right">
            <div class="sidebar-contents">
              <TableOfContents />
            </div>
          </div>
        </section>
        <Scripts />
      </Body>
    </Html>
  )
}
