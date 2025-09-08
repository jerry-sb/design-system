import type { CarouselItem, CarouselOptions, IndicatorItem, RotationItems } from './types';

export declare interface CarouselInterface {
  _items: CarouselItem[];
  _indicators: IndicatorItem[];
  _activeItem: CarouselItem | null;
  _intervalDuration: number;
  _intervalInstance: number | null;
  _options: CarouselOptions;

  init(): void;

  getItem(position: number): CarouselItem;
  getActiveItem(): CarouselItem;

  _setActiveItem(item: CarouselItem): void;

  slideTo(position: number): void;

  next(): void;
  prev(): void;

  _rotate(rotationItems: RotationItems): void;
  cycle(): void;
  pause(): void;

  destroy(): void;
  removeInstance(): void;
  destroyAndRemoveInstance(): void;
}
