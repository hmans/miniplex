---
"miniplex": patch
"@miniplex/core": patch
---

Removed the `.where` iterator builder. It was hard to explain and didn't provide any tangible benefits over simply checking conditions within the for loop body.
