// @jerryshim-ui/flow-dom/src/singletons.ts
import { Instances } from './instances';

const KEY = Symbol.for('@jerryshim-ui/flow-dom');
const g = globalThis as any;

export const instances = g[KEY] || (g[KEY] = new Instances());
export const getInstances = () => (globalThis as any)[KEY] as Instances;
g;
