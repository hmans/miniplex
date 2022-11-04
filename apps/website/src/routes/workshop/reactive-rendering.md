---
title: 3. Reactive Rendering
section: workshop
order: 3
active: true
---

# Reactive Rendering

## A Novel Approach

Reactivity may be the language of user interfaces but Solid's uniqueness comes in the way that it uses it for not only state management but for rendering.

Many frameworks use approaches to rendering that involve some sort of top-down running diffing. That is where we render a tree and then compare it with the last tree to apply changes. The most popular these days being a Virtual DOM. A Virtual DOM involves rendering a virtual representation of the DOM instead of the actual DOM and comparing those to update the actual DOM.

Solid on the other hand uses its Reactivity to make fine-grained subscriptions which only update parts of the DOM on changes instead of doing heavy diffing. This impacts more than performance but the whole mental model of how we write our applications.
## Demystifying Compilation

Through these lessons we will see firsthand how SolidJS actually updates the DOM and how it leverages compiled JSX to make it easy to author our websites. We will explore what a JavaScript framework actually does to update the DOM and how Solid makes this transparent to the developer.

When we are complete not only will you have a firm grasp of Reactivity. But a good understanding of how all rendering works in SolidJS.

## Resources

[Slides](https://docs.google.com/presentation/d/1yT1cgBfeEE-IwQie00Bw7zTMwBPI8rCa1wP2z0RlshM/edit?usp=sharing)

[Todo Example](https://playground.solidjs.com/?hash=-938104522&version=1.4.2)