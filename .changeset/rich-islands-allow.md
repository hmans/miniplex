---
"@miniplex/bucket": patch
---

Buckets now have a version number (accessible through `bucket.version`) that is increased every time an entity is added to or removed from the bucket. They also expose a new `onVersionChanged` event that is triggered whenever the version number changes.
