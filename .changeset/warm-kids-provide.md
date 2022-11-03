---
"@miniplex/react": patch
---

**Breaking Change:** Removed the `as` prop. Please use `children` instead:

```tsx
/* A function component whose props signature matches the entity type */
const User = ({ name }: { name: string }) => <div>{name}</div>

/* Pass it directly into the `children` prop */
<Entity in={users} children={User} />
```

As a reminder, this sort of `children` prop support isn't new; Miniplex has always supported this form:

```tsx
<Entity in={users}>{(user) => <div>{user.name}</div>}</Entity>
```

Passing a `children` prop is just another way to pass children to a React component.
