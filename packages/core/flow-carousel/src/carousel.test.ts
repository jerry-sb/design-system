import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Carousel, { initCarousels } from './index';

vi.mock('@jerryshim-ui/flow-dom', () => {
  const addInstance = vi.fn();
  const removeInstance = vi.fn();
  return {
    instances: { addInstance, removeInstance },
  };
});

import { instances } from '@jerryshim-ui/flow-dom';

const createSlide = (label = '', attrs: Record<string, string | null> = {}) => {
  const el = document.createElement('div');
  el.textContent = label;
  el.setAttribute('data-carousel-item', attrs['data-carousel-item'] ?? '');
  return el as HTMLElement;
};
const createIndicator = (pos: number) => {
  const btn = document.createElement('button');
  btn.setAttribute('data-carousel-slide-to', String(pos));
  return btn as HTMLElement;
};
const createCarouselDOM = (
  opts: { slide?: boolean; interval?: number; count?: number; active?: number } = {},
) => {
  const { slide = false, interval = 3000, count = 3, active = 0 } = opts;
  const root = document.createElement('div');
  root.id = 'carousel';
  root.setAttribute('data-carousel', slide ? 'slide' : 'static');
  root.setAttribute('data-carousel-interval', String(interval));

  for (let i = 0; i < count; i++) {
    root.appendChild(
      createSlide(`s${i + 1}`, { 'data-carousel-item': i === active ? 'active' : '' }),
    );
  }

  const prev = document.createElement('button');
  prev.setAttribute('data-carousel-prev', '');
  root.appendChild(prev);

  const next = document.createElement('button');
  next.setAttribute('data-carousel-next', '');
  root.appendChild(next);

  for (let i = 0; i < count; i++) {
    root.appendChild(createIndicator(i));
  }

  document.body.appendChild(root);
  return { root, prev, next };
};
const getItems = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-item]')).map((el, position) => ({
    position,
    el,
  }));
const getIndicators = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-slide-to]')).map((el) => ({
    position: Number(el.getAttribute('data-carousel-slide-to')),
    el,
  }));

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Carousel constructor and instance registry', () => {
  it('throws if carouselEl is null', () => {
    expect(() => new Carousel(null, [])).toThrowError(/carouselEl is required/);
  });

  it('registers instance with default override=true and provided id', () => {
    const wrap = createCarouselDOM();
    const items = getItems(wrap.root);
    const indicators = getIndicators(wrap.root);
    const c = new Carousel(
      wrap.root,
      items,
      { indicators: { items: indicators } },
      { override: true, id: 'my-id' },
    );

    expect(instances.addInstance).toHaveBeenCalledWith('Carousel', c, 'my-id', true);
  });

  it('removeInstance calls instances.removeInstance with its id', () => {
    const wrap = createCarouselDOM();
    const items = getItems(wrap.root);
    const c = new Carousel(wrap.root, items);
    c.removeInstance();
    expect(instances.removeInstance).toHaveBeenCalledWith('Carousel', c._instanceId);
  });

  it('destroyAndRemoveInstance destroys then removes', () => {
    const wrap = createCarouselDOM();
    const items = getItems(wrap.root);
    const c = new Carousel(wrap.root, items);
    const spyDestroy = vi.spyOn(c, 'destroy');
    const spyRemove = vi.spyOn(c, 'removeInstance');
    c.destroyAndRemoveInstance();
    expect(spyDestroy).toHaveBeenCalledTimes(1);
    expect(spyRemove).toHaveBeenCalledTimes(1);
  });
});

describe('Initialization and rotation', () => {
  it('initializes items with base classes and slides to default position', () => {
    const wrap = createCarouselDOM({ active: 1 });
    const items = getItems(wrap.root);
    const indicators = getIndicators(wrap.root);
    const c = new Carousel(wrap.root, items, {
      defaultPosition: 1,
      indicators: { items: indicators },
    });

    // All items get base classes
    items.forEach(({ el }) => {
      expect(el.classList.contains('absolute')).toBe(true);
      expect(el.classList.contains('inset-0')).toBe(true);
      expect(el.classList.contains('transition-transform')).toBe(true);
      expect(el.classList.contains('transform')).toBe(true);
    });

    // Active item is 1
    expect(c.getActiveItem().position).toBe(1);
  });

  it('rotate three items sets classes for left/middle/right correctly', () => {
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const c = new Carousel(wrap.root, items);

    c.slideTo(1); // middle = 1, left = 0, right = 2
    const [a, b, d] = items.map((x) => x.el);

    // left (0)
    expect(a?.classList.contains('-translate-x-full')).toBe(true);
    expect(a?.classList.contains('z-10')).toBe(true);

    // middle (1)
    expect(b?.classList.contains('translate-x-0')).toBe(true);
    expect(b?.classList.contains('z-30')).toBe(true);
    expect(b?.classList.contains('hidden')).toBe(false);

    // right (2)
    expect(d?.classList.contains('translate-x-full')).toBe(true);
    expect(d?.classList.contains('z-20')).toBe(true);
  });

  it('single item case keeps it visible and centered', () => {
    const root = document.createElement('div');
    root.id = 'one';
    root.setAttribute('data-carousel', 'static');
    const only = createSlide('one', { 'data-carousel-item': 'active' });
    root.appendChild(only);
    document.body.appendChild(root);

    const items = getItems(root);
    const c = new Carousel(root, items);

    c.slideTo(0);
    expect(items?.[0]?.el.classList.contains('translate-x-0')).toBe(true);
    expect(items?.[0]?.el.classList.contains('z-20')).toBe(true);
    expect(items?.[0]?.el.classList.contains('hidden')).toBe(false);
  });
});

describe('Indicators and callbacks', () => {
  it('clicking indicators slides to the corresponding position', () => {
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const indicators = getIndicators(wrap.root);
    const c = new Carousel(wrap.root, items, { indicators: { items: indicators } });
    const spy = vi.spyOn(c, 'slideTo');
    indicators?.[2]?.el.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('onChange is called when slideTo changes slide', () => {
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const onChange = vi.fn();
    const c = new Carousel(wrap.root, items, { onChange });

    c.slideTo(1);
    expect(onChange).toHaveBeenCalledWith(c);
  });

  it('onNext and onPrev are called appropriately', () => {
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const c = new Carousel(wrap.root, items, { onNext, onPrev });

    c.next();
    expect(onNext).toHaveBeenCalledWith(c);

    c.prev();
    expect(onPrev).toHaveBeenCalledWith(c);
  });

  it('indicator classes/aria-current update with _setActiveItem', () => {
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const indicators = getIndicators(wrap.root);
    const activeClasses = 'active-a active-b';
    const inactiveClasses = 'inact-a inact-b';
    const c = new Carousel(wrap.root, items, {
      indicators: { items: indicators, activeClasses, inactiveClasses },
    });

    c.slideTo(1);

    indicators.forEach((ind, i) => {
      if (i === 1) {
        expect(ind.el.getAttribute('aria-current')).toBe('true');
        activeClasses.split(' ').forEach((cl) => expect(ind.el.classList.contains(cl)).toBe(true));
        inactiveClasses
          .split(' ')
          .forEach((cl) => expect(ind.el.classList.contains(cl)).toBe(false));
      } else {
        expect(ind.el.getAttribute('aria-current')).toBe('false');
        inactiveClasses
          .split(' ')
          .forEach((cl) => expect(ind.el.classList.contains(cl)).toBe(true));
      }
    });
  });
});

describe('Interval cycle/pause', () => {
  it('cycle starts interval and triggers next; pause clears it', () => {
    vi.useFakeTimers();
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const onNext = vi.fn();
    const c = new Carousel(wrap.root, items, { interval: 50, onNext });

    c.cycle();
    vi.advanceTimersByTime(60);
    expect(onNext).toHaveBeenCalled();

    const count = onNext.mock.calls.length;
    c.pause();
    vi.advanceTimersByTime(200);
    expect(onNext.mock.calls.length).toBe(count);
  });

  it('slideTo while cycling restarts interval', () => {
    vi.useFakeTimers();
    const wrap = createCarouselDOM({ active: 0 });
    const items = getItems(wrap.root);
    const onNext = vi.fn();
    const c = new Carousel(wrap.root, items, { interval: 100, onNext });

    c.cycle();
    vi.advanceTimersByTime(50);
    c.slideTo(1);
    vi.advanceTimersByTime(60); // previous interval cleared, new one not yet fired
    expect(onNext).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(50); // new interval fires
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe('initCarousels and window exposure', () => {
  it('exposes Carousel and initCarousels on window', () => {
    expect((window as any).Carousel).toBe(Carousel);
    expect((window as any).initCarousels).toBe(initCarousels);
  });

  it('initializes from DOM and wires controls', () => {
    const { root, prev, next } = createCarouselDOM({ slide: false, active: 0 });
    const items = getItems(root);
    const spyNext = vi.spyOn(Carousel.prototype, 'next');
    const spyPrev = vi.spyOn(Carousel.prototype, 'prev');

    initCarousels();

    next.click();
    prev.click();

    expect(spyNext).toHaveBeenCalledTimes(1);
    expect(spyPrev).toHaveBeenCalledTimes(1);
  });

  it('starts cycling when data-carousel="slide"', () => {
    vi.useFakeTimers();
    const { root } = createCarouselDOM({ slide: true, interval: 40, active: 0 });
    const spyNext = vi.spyOn(Carousel.prototype, 'next');

    initCarousels();
    vi.advanceTimersByTime(50);

    expect(spyNext).toHaveBeenCalled();
  });
});
