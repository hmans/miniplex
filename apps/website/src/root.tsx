// @refresh reload
import { Suspense } from "solid-js"
import {
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
import { MainNavigation } from "./components/MainNavigation"
import TableOfContents from "./components/TableOfContents"
import "./css/styles.scss"

export default () => (
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
      <header role="main">
        <div class="title">The Book of Miniplex</div>
        {/* <div>
          <a href="https://miniplex.hmans.co/" target="_blank">
            miniplex.hmans.co
          </a>
        </div> */}
      </header>

      <div class="sidebar sidebar-left">
        <MainNavigation />
      </div>

      <main>
        <ErrorBoundary>
          <Suspense>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <div class="sidebar sidebar-right">
        <TableOfContents />
      </div>

      <Scripts />
    </Body>
  </Html>
)
