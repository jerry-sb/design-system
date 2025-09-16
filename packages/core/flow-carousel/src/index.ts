import { type InstanceOptions, instances } from '@jerryshim-ui/flow-dom';

import type { CarouselInterface } from './interface';
import type { CarouselItem, CarouselOptions, IndicatorItem, RotationItems } from './types';

const Default: CarouselOptions = {
  defaultPosition: 0,
  indicators: {
    items: [],
    activeClasses: 'bg-white dark:bg-gray-800',
    inactiveClasses: 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
  },
  interval: 3000,
  onNext: () => {},
  onPrev: () => {},
  onChange: () => {},
};
const DefaultInstanceOptions: InstanceOptions = {
  override: true,
};

class Carousel implements CarouselInterface {
  _instanceId: string;
  _carouselEl: HTMLElement;
  _items: CarouselItem[];
  _indicators: IndicatorItem[];
  _activeItem: CarouselItem | null;
  _intervalDuration: number;
  _intervalInstance: number | null;
  _options: CarouselOptions;
  _initialized: boolean;

  constructor(
    carouselEl: HTMLElement | null = null,
    items: CarouselItem[] = [],
    options: CarouselOptions = Default,
    instanceOptions: InstanceOptions = DefaultInstanceOptions,
  ) {
    if (!carouselEl) throw new Error('Carousel: carouselEl is required.');

    this._instanceId = (instanceOptions as unknown as { id?: string | null })?.id ?? carouselEl.id;
    this._carouselEl = carouselEl;
    this._items = items;
    this._options = {
      ...Default,
      ...options,
      indicators: { ...Default.indicators, ...options.indicators },
    };
    this._activeItem = this.getItem(this._options?.defaultPosition ?? 0);
    this._indicators = this._options.indicators?.items ?? [];
    this._intervalDuration = this._options?.interval ?? 3000;
    this._intervalInstance = null;
    this._initialized = false;

    this.init();
    instances.addInstance('Carousel', this, this._instanceId, instanceOptions.override);
  }

  /**
   * initialize carousel and items based on active one
   */
  init(): void {
    if (this._items.length && !this._initialized) {
      this._items.forEach((item) => {
        item.el.classList.add('absolute', 'inset-0', 'transition-transform', 'transform');
      });

      // if no active item is set then first position is default
      const initial = this._activeItem ?? this._items[0];
      if (initial) {
        this.slideTo(initial.position);
      } else {
        this.slideTo(0);
      }

      this._indicators.forEach((indicator, position) => {
        indicator.el.addEventListener('click', () => {
          this.slideTo(position);
        });
      });

      this._initialized = true;
    }
  }

  destroy(): void {
    if (this._initialized) {
      this._initialized = false;
    }
  }

  removeInstance(): void {
    instances.removeInstance('Carousel', this._instanceId);
  }

  destroyAndRemoveInstance(): void {
    this.destroy();
    this.removeInstance();
  }

  getItem(position: number): CarouselItem {
    if (!this._items[position]) throw new Error('Carousel: position item not exists.');
    return this._items[position];
  }

  /**
   * Slide to the element based on position
   */
  slideTo(position: number): void {
    const nextItem = this.getItem(position);
    if (!nextItem) return;

    const rotationItems: RotationItems = {
      left:
        nextItem.position === 0
          ? this.getItem(this._items.length - 1)
          : this.getItem(nextItem.position - 1),
      middle: nextItem,
      right:
        nextItem.position === this._items.length - 1
          ? this.getItem(0)
          : this.getItem(nextItem.position + 1),
    };

    this._rotate(rotationItems);
    this._setActiveItem(nextItem);

    if (this._intervalInstance !== null) {
      this.pause();
      this.cycle();
    }

    if (this._options.onChange) this._options.onChange(this);
  }

  /**
   * Based on the currently active item it will go to the next position
   */
  next(): void {
    const activeItem = this.getActiveItem();
    const nextItem =
      activeItem.position === this._items.length - 1
        ? this.getItem(0)
        : this.getItem(activeItem.position + 1);

    this.slideTo(nextItem.position);
    if (this._options.onNext) this._options.onNext(this);
  }

  /**
   * Based on the currently active item it will go to the previous position
   */
  prev(): void {
    const activeItem = this.getActiveItem();
    const prevItem =
      activeItem.position === 0
        ? this.getItem(this._items.length - 1)
        : this.getItem(activeItem.position - 1);

    this.slideTo(prevItem.position);
    if (this._options.onPrev) this._options.onPrev(this);
  }

  /**
   * This method applies the transform classes based on the left, middle, and right rotation carousel items
   */
  _rotate(rotationItems: RotationItems): void {
    // reset
    this._items.forEach((item) => {
      item.el.classList.add('hidden');
    });

    // Handling the case when there is only one item
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

    // left item (previously active)
    rotationItems.left.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-20',
    );
    rotationItems.left.el.classList.add('-translate-x-full', 'z-10');

    // currently active item
    rotationItems.middle.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-10',
    );
    rotationItems.middle.el.classList.add('translate-x-0', 'z-30');

    // right item (upcoming active)
    rotationItems.right.el.classList.remove(
      '-translate-x-full',
      'translate-x-full',
      'translate-x-0',
      'hidden',
      'z-30',
    );
    rotationItems.right.el.classList.add('translate-x-full', 'z-20');
  }

  /**
   * Set an interval to cycle through the carousel items
   */
  cycle(): void {
    if (typeof window !== 'undefined') {
      this._intervalInstance = window.setInterval(() => {
        this.next();
      }, this._intervalDuration);
    }
  }

  /**
   * Clears the cycling interval
   */
  pause(): void {
    if (this._intervalInstance !== null) {
      clearInterval(this._intervalInstance);
      this._intervalInstance = null;
    }
  }

  /**
   * Get the currently active item (non-null)
   */
  getActiveItem(): CarouselItem {
    if (!this._activeItem) throw new Error('Carousel: active item not set.');
    return this._activeItem;
  }

  /**
   * Set the currently active item and data attribute
   */
  _setActiveItem(item: CarouselItem): void {
    this._activeItem = item;
    const position = item.position;

    // update the indicators if available
    if (this._indicators.length) {
      this._indicators.forEach((indicator) => {
        indicator.el.setAttribute('aria-current', 'false');

        if (this._options.indicators) {
          indicator.el.classList.remove(
            ...(this._options.indicators.activeClasses ?? '').split(' '),
          );
          indicator.el.classList.add(
            ...(this._options.indicators.inactiveClasses ?? '').split(' '),
          );
        }
      });

      if (this._indicators[position] && this._options.indicators) {
        this._indicators[position].el.classList.add(
          ...(this._options.indicators.activeClasses ?? '').split(' '),
        );
        this._indicators[position].el.classList.remove(
          ...(this._options.indicators.inactiveClasses ?? '').split(' '),
        );
        this._indicators[position].el.setAttribute('aria-current', 'true');
      }
    }
  }

  updateOnNext(callback: () => void): void {
    this._options.onNext = callback;
  }

  updateOnPrev(callback: () => void): void {
    this._options.onPrev = callback;
  }

  updateOnChange(callback: () => void): void {
    this._options.onChange = callback;
  }
}

export function initCarousels(): void {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(($carouselEl) => {
    const intervalAttr = $carouselEl.getAttribute('data-carousel-interval');
    const interval = intervalAttr ? parseInt(intervalAttr) : undefined;
    const slide = $carouselEl.getAttribute('data-carousel') === 'slide';
    const items: CarouselItem[] = [];
    let defaultPosition = 0;
    const itemEls = $carouselEl.querySelectorAll<HTMLElement>('[data-carousel-item]');
    if (itemEls.length) {
      Array.from(itemEls).forEach(($carouselItemEl, position) => {
        items.push({ position, el: $carouselItemEl });

        if ($carouselItemEl.getAttribute('data-carousel-item') === 'active') {
          defaultPosition = position;
        }
      });
    }

    const indicators: IndicatorItem[] = [];
    const indicatorEls = $carouselEl.querySelectorAll<HTMLElement>('[data-carousel-slide-to]');
    if (indicatorEls.length) {
      Array.from(indicatorEls).forEach(($indicatorEl) => {
        const posAttr = $indicatorEl.getAttribute('data-carousel-slide-to');
        if (posAttr != null) {
          indicators.push({
            position: parseInt(posAttr, 10),
            el: $indicatorEl,
          });
        }
      });
    }

    const carousel = new Carousel($carouselEl, items, {
      defaultPosition,
      indicators: { items: indicators },
      interval: interval ?? Default.interval,
    });

    if (slide) {
      carousel.cycle();
    }

    // controls
    const carouselNextEl = $carouselEl.querySelector<HTMLElement>('[data-carousel-next]');
    const carouselPrevEl = $carouselEl.querySelector<HTMLElement>('[data-carousel-prev]');

    if (carouselNextEl) {
      carouselNextEl.addEventListener('click', () => carousel.next());
    }
    if (carouselPrevEl) {
      carouselPrevEl.addEventListener('click', () => carousel.prev());
    }
  });
}

declare module '@jerryshim-ui/flow-dom' {
  interface ComponentMap {
    Carousel: import('./interface').CarouselInterface;
  }
}

declare global {
  interface Window {
    Carousel: typeof Carousel;
    initCarousels: typeof initCarousels;
  }
}

if (typeof window !== 'undefined') {
  window.Carousel = Carousel;
  window.initCarousels = initCarousels;
}

export default Carousel;
