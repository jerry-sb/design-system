export declare type InstanceOptions = {
  id?: string;
  override?: boolean;
};

export declare type EventListenerInstance = {
  element: HTMLElement;
  type: string;
  handler: EventListenerOrEventListenerObject;
};

/**
 * EventListenerOrEventListenerObject
 * element.addEventListener(type, listener, options?);
 *
 * const handler = (event: Event) => {
 *      ...logic
 * }
 * buttonEl.addEventListener("click", handler);
 *
 * const handlerObj: EventListenerObject = {
 *      handleEvent(event) {
 *          ...logic
 *      }
 * }
 * button.addEventListener("click", handlerObj);
 */
