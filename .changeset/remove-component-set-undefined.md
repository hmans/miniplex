---
"miniplex": patch
---

`World.removeComponent` now assigns `undefined` to the removed component instead of using the `delete` operator.

Queries already treat a component as absent when its value is `undefined`, so this is fully transparent to `with`/`without`/`where` queries. Assigning `undefined` keeps the entity's object shape stable (avoiding V8 deoptimizations — measurably faster component removal and post-removal iteration) and routes the change through any property setters/proxies, making miniplex compatible with reactive/observed objects such as [Colyseus](https://colyseus.io) schemas.

Note: the property key is now retained on the entity (with value `undefined`) rather than removed, so checks that rely on key presence (e.g. `"foo" in entity` or `Object.keys(entity)`) will continue to see it.
