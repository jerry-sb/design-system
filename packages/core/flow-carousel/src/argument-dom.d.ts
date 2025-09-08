export {};

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
