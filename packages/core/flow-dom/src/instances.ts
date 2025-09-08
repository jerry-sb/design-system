interface BaseInstance {
  destroy(): void;
  destroyAndRemoveInstance?(): void;
}

export interface ComponentMap {}

type Key = keyof ComponentMap & string;
type Bucket<K extends Key> = Record<string, ComponentMap[K] & BaseInstance>;

export class Instances {
  private _instances: Record<string, Record<string, BaseInstance>> = {};

  addInstance<K extends Key>(
    component: K,
    instance: ComponentMap[K] & BaseInstance,
    id?: string,
    override = false,
  ) {
    const bucket = (this._instances[component] ||= {});
    const key = id ?? this._rand();

    if (bucket[key] && !override) {
      console.warn(`Instance with ID ${key} already exists.`);
      return;
    }

    if (override && bucket[key]?.destroyAndRemoveInstance) {
      bucket[key]!.destroyAndRemoveInstance();
    }

    bucket[key] = instance;
  }

  getInstance<K extends Key>(component: K, id: string) {
    return this._instances[component]?.[id] as (ComponentMap[K] & BaseInstance) | undefined;
  }

  getInstances<K extends Key>(component: K): Bucket<K> | undefined {
    const bucket = this._instances[component];
    if (!bucket) return undefined;

    for (const _ in bucket) return bucket as Bucket<K>;
    return undefined;
  }

  getAllInstances() {
    return this._instances;
  }

  destroyAndRemoveInstance<K extends Key>(component: K, id: string) {
    this.destroyInstanceObject(component, id);
    this.removeInstance(component, id);
  }

  removeInstance<K extends Key>(component: K, id: string) {
    if (this.instanceExists(component, id)) {
      delete this._instances[component]?.[id];
    }
  }

  destroyInstanceObject<K extends Key>(component: K, id: string) {
    if (this.instanceExists(component, id)) {
      this._instances[component]?.[id]?.destroy();
    }
  }

  instanceExists<K extends Key>(component: K, id: string) {
    if (!this._instances[component]) {
      return false;
    }

    if (!this._instances[component][id]) {
      return false;
    }

    return true;
  }

  private _rand() {
    return Math.random().toString(36).slice(2, 11);
  }
}

export const instances = new Instances();

declare global {
  interface Window {
    JerryInstances?: Instances;
  }
}

if (typeof window !== 'undefined') window.JerryInstances = instances;
