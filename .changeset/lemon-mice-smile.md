---
"@miniplex/bucket": patch
"@miniplex/core": patch
"@miniplex/react": patch
---

**Breaking Change:** the core `Bucket` class now uses [Eventery](https://github.com/hmans/eventery) for its `onEntityAdded` and `onEntityRemoved` events, which has a slightly different API than the library used before, since it uses `.subscribe(listener)` and `.unsubscribe(listener)` instead of `.add` and `.remove`.
