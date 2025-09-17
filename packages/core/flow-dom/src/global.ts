// @jerryshim-ui/flow-dom/src/global.ts
import { instances } from './singletons';

declare global {
  interface Window {
    JerryInstances?: typeof instances;
  }
}

if (typeof window !== 'undefined') {
  (globalThis as any)[Symbol.for('@jerryshim-ui/flow-dom')] = instances;
  (window as any).JerryInstances = instances;
  console.info('[flow-dom] global evaluated');
}
