import { Carousel } from './carousel';
import { initCarousels } from './init';

export type {} from './augment-flow-dom';
export { Carousel } from './carousel';
export { initCarousels } from './init';
export * from './types';

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
