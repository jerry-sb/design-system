## @jerryshim-ui/flow-dom

Lightweight DOM utilities for global event wiring and cross-component instance management.

- **Events**: Batch-bind functions to a window event type.
- **Instances**: A central registry to add/get/destroy UI component instances by component key and instance id.

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
import { Events } from '@jerryshim-ui/flow-dom';

const onResize: EventListener = () => {
  // ...your logic
};

const onKeydown: EventListener = (e) => {
  // ...your logic
};

// Attach listeners to window only when running in a browser
new Events('resize', [onResize]).init();
new Events('keydown', [onKeydown]).init();
```

Notes:

- `Events` safely checks for `window` before binding.
- It adds each provided function via `window.addEventListener(type, fn)`.

#### Instances

```ts
import { instances } from '@jerryshim-ui/flow-dom';

// Any object that implements a destroy lifecycle can be stored
type ButtonInstance = {
  destroy(): void;
  destroyAndRemoveInstance?(): void; // optional specialized cleanup
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

// List bucket (record of id -> instance) for a component
const bucket = instances.getInstances('Button');

// Cleanup
instances.destroyAndRemoveInstance('Button', 'btn-1');
```

Override behavior:

```ts
instances.addInstance('Modal', modalA, 'm1');
// Overrides existing instance at the same id.
// If the old instance has destroyAndRemoveInstance, it will be called.
instances.addInstance('Modal', modalB, 'm1', true);
```

Optional TypeScript augmentation (for strong typing):

```ts
// e.g., in a global.d.ts in your app code
declare module '@jerryshim-ui/flow-dom' {
  interface ComponentMap {
    Button: ButtonInstance;
    Modal: { destroy(): void; destroyAndRemoveInstance?(): void };
  }
}
```

### API Reference

Exports:

- `Events` (class)
  - `new Events(eventType: string, eventFunctions?: EventListener[])`
  - `init(): void` – binds provided functions to `window` for the given `eventType`
- `instances` (singleton of `Instances`)
  - `addInstance(component, instance, id?, override = false)`
  - `getInstance(component, id)`
  - `getInstances(component)` → `Record<string, Instance> | undefined`
  - `getAllInstances()` → internal store
  - `destroyAndRemoveInstance(component, id)`
  - `removeInstance(component, id)`
  - `destroyInstanceObject(component, id)`
  - `instanceExists(component, id)`
- Types: `EventListenerInstance`, `InstanceOptions`

Browser global for debugging:

- When `window` exists, `window.JerryInstances` references the same `instances` registry.

### License

MIT
