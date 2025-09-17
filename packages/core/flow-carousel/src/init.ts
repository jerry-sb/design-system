import { type EventDisposer, getInstances, on } from '@jerryshim-ui/flow-dom';

import { Carousel } from './carousel';
import type { CarouselItem, IndicatorItem } from './types';

const controlsMap = new WeakMap<HTMLElement, EventDisposer[]>();

export function initCarousels(root: ParentNode = document) {
  const disposers: EventDisposer[] = [];

  root.querySelectorAll<HTMLElement>('[data-carousel]').forEach(($el) => {
    const id = $el.id || ($el.id = crypto.randomUUID());
    if (getInstances().getInstance('Carousel' as any, id)) return;

    const intervalAttr = $el.getAttribute('data-carousel-interval');
    const interval = intervalAttr ? parseInt(intervalAttr) : undefined;
    const slide = $el.getAttribute('data-carousel') === 'slide';
    // items
    const items: CarouselItem[] = [];
    const itemEls = $el.querySelectorAll<HTMLElement>('[data-carousel-item]');
    let defaultPosition = 0;
    if (itemEls.length) {
      Array.from(itemEls).forEach(($item, position) => {
        items.push({ position, el: $item });
        if ($item.getAttribute('data-carousel-item') === 'active') defaultPosition = position;
      });
    }

    // indicators
    const indicators: IndicatorItem[] = [];
    const indicatorEls = $el.querySelectorAll<HTMLElement>('[data-carousel-slide-to]');
    if (indicatorEls.length) {
      Array.from(indicatorEls).forEach(($indicator) => {
        const posAttr = $indicator.getAttribute('data-carousel-slide-to');
        if (posAttr != null) indicators.push({ position: parseInt(posAttr, 10), el: $indicator });
      });
    }

    const carousel = new Carousel($el, items, {
      defaultPosition,
      indicators: { items: indicators },
      interval: interval ?? 3000,
    });
    // controls
    const offList: EventDisposer[] = [];
    const nextEl = $el.querySelector<HTMLElement>('[data-carousel-next]');
    const prevEl = $el.querySelector<HTMLElement>('[data-carousel-prev]');
    if (nextEl) offList.push(on(nextEl, 'click', () => carousel.next()));
    if (prevEl) offList.push(on(prevEl, 'click', () => carousel.prev()));
    controlsMap.set($el, offList);

    if (slide) carousel.cycle();

    // root 단위 정리 disposer
    disposers.push(() => {
      offList.forEach((off) => off());
      carousel.destroyAndRemoveInstance();
      controlsMap.delete($el);
    });
  });

  // 호출자에게 정리 함수 반환(선택)
  return () => disposers.forEach((off) => off());
}
