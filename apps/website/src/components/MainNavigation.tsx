import { For } from "solid-js"
import { A } from "solid-start"

type Configuration = {
  sidebar: Entry[]
}

type Entry = {
  path?: string
  title: string
  children?: Entry[]
}

const configuration: Configuration = {
  sidebar: [
    {
      path: "introduction",
      title: "Introduction"
    },
    {
      path: "what-is-ecs",
      title: "What is ECS?"
    },
    {
      title: "Manual"
    },
    {
      path: "/manual/installation",
      title: "Installation"
    },
    {
      path: "/manual/basic-usage",
      title: "Basic Usage"
    },
    {
      path: "/manual/advanced-usage",
      title: "Advanced Usage"
    },
    {
      path: "/manual/best-practices",
      title: "Best Practices"
    },
    {
      title: "Guides"
    },
    {
      path: "/guides/performance",
      title: "Performance"
    }
  ]
}

const NavigationList = ({ entries }: { entries: Entry[]; prefix?: string }) => (
  <ul>
    <For each={entries}>
      {(entry) => (
        <li>
          {entry.path ? (
            <A href={entry.path} activeClass="current">
              {entry.title}
            </A>
          ) : (
            <div class="section-title">{entry.title}</div>
          )}
        </li>
      )}
    </For>
  </ul>
)

export const MainNavigation = () => (
  <nav role="main">
    <NavigationList entries={configuration.sidebar} />
  </nav>
)
