import type { EventDisposer } from '@jerryshim-ui/flow-dom';
import { getInstances, on } from '@jerryshim-ui/flow-dom';

import type { CarouselInterface } from './interface';
import type { CarouselItem, CarouselOptions, IndicatorItem, RotationItems } from './types';

const Default: Required<Omit<CarouselOptions, 'indicators'>> & {
  indicators: Required<NonNullable<CarouselOptions['indicators']>>;
} = {
  defaultPosition: 0,
  interval: 3000,
  onNext: () => {},
  onPrev: () => {},
  onChange: () => {},
  indicators: {
    items: [],
    activeClasses: 'bg-white dark:bg-gray-800',
    inactiveClasses: 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
  },
};

export class Carousel implements CarouselInterface {
  _instanceId: string;
  _carouselEl: HTMLElement;
  _items: CarouselItem[];
  _indicators: IndicatorItem[];
  _activeItem: CarouselItem | null;
  _intervalDuration: number;
  _intervalInstance: number | null;
  _options: CarouselOptions;
  _initialized: boolean;
  private _offs: EventDisposer[] = [];

  constructor(el: HTMLElement, items: CarouselItem[] = [], options: CarouselOptions = {}) {
    if (!el) throw new Error('Carousel: el is required.');

    this._instanceId = el.id || '';
    this._carouselEl = el;
    this._items = items;
    this._options = {
      ...Default,
      ...options,
      indicators: { ...Default.indicators, ...(options.indicators ?? {}) },
    };
    this._activeItem = this.getItem(this._options.defaultPosition ?? 0);
    this._indicators = this._options.indicators?.items ?? [];
    this._intervalDuration = this._options.interval ?? 3000;
    this._intervalInstance = null;
    this._initialized = false;

    this.init();
    getInstances().addInstance('Carousel', this as any, this._instanceId, true);
  }

  init(): void {
    if (this._initialized || !this._items.length) return;

    this._items.forEach((item) => {
      item.el.classList.add('absolute', 'inset-0', 'transition-transform', 'transform');
    });

    const initial = this._activeItem ?? this._items[0];
    if (initial) this.slideTo(initial.position);
    else this.slideTo(0);

    this._indicators.forEach((indicator, position) => {
      this._offs.push(on(indicator.el, 'click', () => this.slideTo(position)));
    });

    this._initialized = true;
  }

  destroy(): void {
    if (!this._initialized) return;
    this.pause();
    this._offs.forEach((off) => off());
    this._offs = [];
    this._initialized = false;
  }

  removeInstance(): void {
    getInstances().removeInstance('Carousel' as any, this._instanceId);
  }

  destroyAndRemoveInstance(): void {
    this.destroy();
    this.removeInstance();
  }

  getItem(position: number): CarouselItem {
    const item = this._items[position];
    if (!item) throw new Error('Carousel: position item not exists.');
    return item;
  }

  slideTo(position: number): void {
    const nextItem = this.getItem(position);
    if (!nextItem) return;

    const len = this._items.length;
    const rotationItems: RotationItems = {
      left: nextItem.position === 0 ? this.getItem(len - 1) : this.getItem(nextItem.position - 1),
      middle: nextItem,
      right: nextItem.position === len - 1 ? this.getItem(0) : this.getItem(nextItem.position + 1),
    };

    this._rotate(rotationItems);
    this._setActiveItem(nextItem);

    if (this._intervalInstance !== null) {
      this.pause();
      this.cycle();
    }

    this._options.onChange?.(this);
  }

  next(): void {
    const activeItem = this.getActiveItem();
    const nextItem =
      activeItem.position === this._items.length - 1
        ? this.getItem(0)
        : this.getItem(activeItem.position + 1);
    this.slideTo(nextItem.position);
    this._options.onNext?.(this);
  }

  prev(): void {
    const activeItem = this.getActiveItem();
    const prevItem =
      activeItem.position === 0
        ? this.getItem(this._items.length - 1)
        : this.getItem(activeItem.position - 1);
    this.slideTo(prevItem.position);
    this._options.onPrev?.(this);
  }

  _rotate(rotationItems: RotationItems): void {
    // reset
    this._items.forEach((item) => item.el.classList.add('hidden'));

    if (this._items.length === 1) {
      rotationItems.middle.el.classList.remove(
        '-translate-x-full',
        'translate-x-full',
        'translate-x-0',
        'hidden',
        'z-10',
      );
      rotationItems.middle.el.classList.add('translate-x-0', 'z-20');
      return;
    }

    // left
    rotationItems.left.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-20',
    );
    rotationItems.left.el.classList.add('-translate-x-full', 'z-10');

    // middle
    rotationItems.middle.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-10',
    );
    rotationItems.middle.el.classList.add('translate-x-0', 'z-30');

    // right
    rotationItems.right.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-30',
    );
    rotationItems.right.el.classList.add('translate-x-full', 'z-20');
  }

  cycle(): void {
    if (typeof window !== 'undefined') {
      this._intervalInstance = window.setInterval(() => this.next(), this._intervalDuration);
    }
  }

  pause(): void {
    if (this._intervalInstance !== null) {
      clearInterval(this._intervalInstance);
      this._intervalInstance = null;
    }
  }

  getActiveItem(): CarouselItem {
    if (!this._activeItem) throw new Error('Carousel: active item not set.');
    return this._activeItem;
  }

  _setActiveItem(item: CarouselItem): void {
    this._activeItem = item;
    const position = item.position;

    if (this._indicators.length) {
      this._indicators.forEach((indicator) => {
        indicator.el.setAttribute('aria-current', 'false');
        const act = this._options.indicators?.activeClasses ?? '';
        const ina = this._options.indicators?.inactiveClasses ?? '';
        if (act) indicator.el.classList.remove(...act.split(' '));
        if (ina) indicator.el.classList.add(...ina.split(' '));
      });

      const active = this._indicators[position];
      if (active && this._options.indicators) {
        const act = this._options.indicators.activeClasses ?? '';
        const ina = this._options.indicators.inactiveClasses ?? '';
        if (act) active.el.classList.add(...act.split(' '));
        if (ina) active.el.classList.remove(...ina.split(' '));
        active.el.setAttribute('aria-current', 'true');
      }
    }
  }
}
