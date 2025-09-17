// 이 한 줄은 어떤 빌드 환경에서든 이 모듈이 프로그램에 확실히 포함되게 하는 안전핀

import type { CarouselInterface } from './interface';

declare module '@jerryshim-ui/flow-dom' {
  interface ComponentMap {
    Carousel: CarouselInterface;
  }
}

export {};
