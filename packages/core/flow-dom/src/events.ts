export type EventDisposer = () => void;

export function on(
  target: EventTarget,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
): EventDisposer {
  target.addEventListener(type, handler, options as any);
  return () => target.removeEventListener(type, handler, options as any);
}

export function onWindow(
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
): EventDisposer {
  if (typeof window === 'undefined') return () => {};
  return on(window, type, handler, options);
}

// 여러 개를 한 번에 바인딩하고 한 번에 해제
export function bindAll(
  items: {
    target: EventTarget;
    type: string;
    handler: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
  }[],
): EventDisposer {
  const offs = items.map(({ target, type, handler, options }) =>
    on(target, type, handler, options),
  );
  return () => offs.forEach((off) => off());
}
