---
"miniplex": patch
---

`World.reindex(entity)` is now a public method. When creating queries that use `.where(predicate)` to check entities _by value_, you are expected to use it to notify the world that an entity whose values you have mutated should be reindexed.
