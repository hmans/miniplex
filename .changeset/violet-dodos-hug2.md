---
"miniplex": minor
---

**Breaking Change:** Miniplex will no longer automatically add an `id` component to created entities. Instead, it will add a `miniplex` entity that contains an `id` property, among other data that is mostly used internally. If you've been using `entity.id` in your code, you'll need to update it to use `entity.miniplex.id`.
