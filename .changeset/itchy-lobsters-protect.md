---
"@miniplex/react": patch
---

When `<Property>` encounters an entity that has the property already set, it will not add or remove the proprty on mount or unmount, but it will still update the property if the value changes. When unmounting, it will restore the property to the value it had before the component was mounted.
