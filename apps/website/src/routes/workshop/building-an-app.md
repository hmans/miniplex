---
title: 5. Building an App
section: workshop
order: 5
active: true
---

# Building a Simple App

Congratulations. You've made it through most of my lecturing and are ready to actually build something with SolidJS.

## Getting Setup

We are going to get started in the simplest way and build a simple client side application to get started.

Stackblitz:
```
https://solid.new
```

CLI:
```
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

These templates use Vite to build which takes care of most things we need to worry about.

## Building a Todos App

This is the classic example but it really highlights Solid's approach to state management. We will evolve this through the next couple lessons to teach some of the more advanced topics.

## Resources

We will grab some base resources like the index.html and css from the [resources folder](https://github.com/ryansolid/solid-course/tree/main/resources/todomvc-resources)