---
"@miniplex/core": patch
---

Aaaaah, another rewrite of the core library! `@miniplex/core` kept the same lightweight core, but the `World` is now much more aware of archetypes and what kind of entities they represent. This was done to allow for better introspection and to fix some remaining issues like [#204](https://github.com/hmans/miniplex/issues/204)].

The `WithRequiredKeys` type has been renamed to `WithComponents`.

`world.archetype()` now allows two forms:

```ts
world.archetype("position", "velocity")
world.archetype({ all: ["position", "velocity"] })
```

The second form involves a query object that can also have `any` and `none` keys:

```ts
world.archetype({
  all: ["position", "velocity"],
  none: ["dead"]
})
```

**Breaking Change:** `bucket.derive()` has been removed. It was cool and fun and cute, but also a little too generic to be useful. Similar to Miniplex 1.0, there is only the _world_ and a series of _archetypes_ now. (But both share the same lightweight `Bucket` base class that can also be used standalone.)
