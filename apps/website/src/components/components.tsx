import { Title as MetaTitle } from "@solidjs/meta"
import A from "./A"

export const components = {
  h1: (props) => (
    <h1 {...props}>
      <MetaTitle>{props.children}</MetaTitle>
      {props.children}
    </h1>
  ),
  a: (props) => {
    return <A {...props}>{props.children}</A>
  },
  A,
  aside: (props) => (
    <aside {...props}>
      <div>WARNING</div>
      <div>{props.children}</div>
    </aside>
  )
}
