import { Title as MetaTitle } from "@solidjs/meta"
import "tippy.js/dist/tippy.css"
import A from "./A"

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
