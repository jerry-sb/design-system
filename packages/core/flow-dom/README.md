## @jerryshim-ui/flow-dom

A lightweight DOM utility module for browser environments.

- **Event utilities**: `on`, `onWindow`, `bindAll` (all return an `EventDisposer`)
- **Instance registry**: `Instances` class and `instances` / `getInstances` (symbol-backed global singleton)
- **Optional browser global**: importing `@jerryshim-ui/flow-dom/global` exposes `window.JerryInstances`

### Installation

```bash
pnpm add @jerryshim-ui/flow-dom
# or
npm i @jerryshim-ui/flow-dom
# or
yarn add @jerryshim-ui/flow-dom
```

### Quick Start

#### Events

```ts
import { onWindow, bindAll } from '@jerryshim-ui/flow-dom';

const offResize = onWindow('resize', () => {
  // ...your logic
});

// Bind multiple listeners at once and dispose them together
const offAll = bindAll([
  {
    target: window,
    type: 'keydown',
    handler: (e) => {
      /* ... */
    },
  },
  {
    target: document,
    type: 'visibilitychange',
    handler: () => {
      /* ... */
    },
  },
]);

// Later, dispose
offResize();
offAll();
```

Notes:

- `onWindow` safely becomes a no-op on the server.
- All event utilities return an `EventDisposer` (a function to remove the listener).

##### EventDisposer

- `EventDisposer` is a function type: `type EventDisposer = () => void`.
- Calling the function returned by `on`, `onWindow`, or `bindAll` removes the bound listener(s).
- `bindAll([...])` binds multiple listeners and returns a single disposer that removes them all.

#### Instances

```ts
import { instances } from '@jerryshim-ui/flow-dom';

// Any object with a destroy lifecycle can be stored
type ButtonInstance = {
  destroy(): void;
  destroyAndRemoveInstance?(): void; // optional, for more thorough cleanup
};

const button1: ButtonInstance = {
  destroy() {
    // cleanup logic
  },
};

// Add
instances.addInstance('Button', button1, 'btn-1');

// Get a single instance
const i = instances.getInstance('Button', 'btn-1');

// Get the bucket (id -> instance record) for a component
const bucket = instances.getInstances('Button');

// Cleanup
instances.destroyAndRemoveInstance('Button', 'btn-1');
```

Override behavior:

```ts
instances.addInstance('Modal', modalA, 'm1');
// Overwrites the existing instance at the same id.
// If the old instance has destroyAndRemoveInstance, it is called first.
instances.addInstance('Modal', modalB, 'm1', true);
```

Optional TypeScript augmentation (for stronger typing):

```ts
// e.g., in your app's global.d.ts
declare module '@jerryshim-ui/flow-dom' {
  interface ComponentMap {
    Button: ButtonInstance;
    Modal: { destroy(): void; destroyAndRemoveInstance?(): void };
  }
}
```

### API Summary

Exports:

- Events
  - `on(target, type, handler, options?) => EventDisposer`
  - `onWindow(type, handler, options?) => EventDisposer`
  - `bindAll(items: { target; type; handler; options? }[]) => EventDisposer`

- Instances
  - `instances: Instances` (singleton)
  - `getInstances(): Instances` (accessor)
  - `Instances` methods:
    - `addInstance(component, instance, id?, override = false)`
    - `getInstance(component, id)`
    - `getInstances(component)` → `Record<string, Instance> | undefined`
    - `getAllInstances()` → returns the internal store
    - `destroyAndRemoveInstance(component, id)`
    - `removeInstance(component, id)`
    - `destroyInstanceObject(component, id)`
    - `instanceExists(component, id)`

- Types: `EventDisposer`, `EventListenerInstance`, `InstanceOptions`

### Singleton & Global Access

- At runtime, a single registry is shared via `Symbol.for('@jerryshim-ui/flow-dom')`.
- `instances` and `getInstances()` both point to the same symbol-backed store (safe across HMR / multi-bundle setups).

```ts
import { instances, getInstances } from '@jerryshim-ui/flow-dom';

const same = instances === getInstances(); // true

// Low-level access (optional)
const key = Symbol.for('@jerryshim-ui/flow-dom');
const store = (globalThis as any)[key];
```

Browser global for debugging (optional):

- Importing `@jerryshim-ui/flow-dom/global` sets `window.JerryInstances = instances` and prints a small debug log.

### License

MIT

# Third-Party Notices

This product includes portions adapted from Flowbite.

## Flowbite

- License: MIT
- Copyright: Flowbite contributors
- Source: https://github.com/themesberg/flowbite
