---
"miniplex": minor
---

**Breaking Change:** The API signature of `createEntity` has been simplified in order to improve clarity of the API and reduce complexity in both implementation and types. `createEntity` now only supports a single argument, which _must_ satisfy the world's entity type.

This will only affect you if you have been using `createEntity` with more than one argument in order to compose entities from partial entities, like so:

```js
const entity = createEntity(position(0, 0), velocity(1, 1), health(100))
```

This always had the issue of `createEntity` not checking the initial state of the entity against the world's entity type. Theoretically, the library could invest some additional effort into complex type assembly to ensure that the entity is valid, but there are enough object composition tools available already, so it felt like an unneccessary duplication.

Instead, composition is now deferred into userland, where one of the most simple tools is the spread operator:

```js
const entity = createEntity({
  ...position(0, 0),
  ...velocity(1, 1),
  ...health(100)
})
```
