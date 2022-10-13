---
"miniplex": patch
---

Iterating over a bucket will now iterate over its entities _in reverse order_, which makes it a little safer to synchronously remove entities from within a system.
