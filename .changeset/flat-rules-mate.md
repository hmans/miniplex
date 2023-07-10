---
"miniplex-react": patch
"miniplex": patch
---

**Breaking Change:** Restructured the main entrypoint packages to what they were in Miniplex 1.0, with the `miniplex` package now only providing the vanilla, framework-agnostic ECS functionality, and `miniplex-react` adding the React glue (and using `miniplex` as a peer dependency.)
