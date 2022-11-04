import { Title as MetaTitle } from "@solidjs/meta"
import { createUniqueId, mergeProps, Show } from "solid-js"
import { unstable_island } from "solid-start"
import "tippy.js/dist/tippy.css"
import A from "./A"
const Tooltip = unstable_island(() => import("./tooltip"))

export const components = {
  h1: (props) => (
    <h1 {...props}>
      <MetaTitle>{props.children}</MetaTitle>
      {props.children}
    </h1>
  ),
  ssr: (props) => <>{props.children}</>,
  spa: (props) => <></>,
  p: (props) => <p {...props}>{props.children}</p>,
  a: (props) => {
    return <A {...props}>{props.children}</A>
  },
  "token-link": (props) => {
    return <span>{props.children}</span>
  },
  li: (props) => <li {...props}>{props.children}</li>,
  ul: (props) => <ul {...props}>{props.children}</ul>,
  ol: (props) => <ol {...props}>{props.children}</ol>,
  nav: (props) => <nav {...props}>{props.children}</nav>,
  A,
  "table-of-contents": (props) => {},
  code: (props) => {
    return (
      <span class="not-prose">
        <code {...props}>{props.children}</code>
      </span>
    )
  },
  pre: (props) => (
    <div>
      <Show when={props.filename?.length > 5}>
        <div class={`${props.className}`}>{props.filename}</div>
      </Show>
      <pre
        {...mergeProps(props, {
          get classList() {
            return {
              [props.className]: true,
              ["rounded-b mt-0 px-0"]: true,
              ["border-red-400 border-2 bad"]: props.bad,
              ["border-green-400 border-2 good"]: props.good,
              ["snippet"]: !props.good && !props.bad,
              ["rounded-t-none"]: props.filename?.length
            }
          },
          get className() {
            return undefined
          }
        })}
      >
        {props.children}
      </pre>
    </div>
  ),
  "data-lsp": (props) => {
    const id = createUniqueId()

    return (
      <Tooltip id={id}>
        {props.children}
        <div id={id} style="display: none;">
          <pre>{props.lsp}</pre>
        </div>
      </Tooltip>
    )
  },
  h5: (props) => <h5 {...props}>{props.children}</h5>,
  "docs-error": (props) => {
    return (
      <div class="docs-error">
        <p>
          <span>Error:</span>
          {props.children}
        </p>
      </div>
    )
  },
  "docs-info": (props) => {
    return (
      <div class="docs-error">
        <p>
          <span>Error:</span>
          {props.children}
        </p>
      </div>
    )
  },
  aside: (props) => (
    <aside {...props}>
      <div>WARNING</div>
      <div>{props.children}</div>
    </aside>
  ),
  response: (props) => {
    return <span>{props.children}</span>
  },
  void: (props) => {
    return <span>{props.children}</span>
  },
  unknown: (props) => {
    return <span>{props.children}</span>
  }
}
