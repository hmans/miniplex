---
"@miniplex/core": patch
---

`world.archetype` is gone. Instead, there is `world.where(predicate)`. For archetype queries, please use `world.where(archetype("foo", "bar"))`.
