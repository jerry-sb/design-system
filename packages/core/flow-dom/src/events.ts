export class Events {
  private _eventType: string;
  private _eventFunctions: EventListener[];

  constructor(eventType: string, eventFucntions: EventListener[] = []) {
    this._eventType = eventType;
    this._eventFunctions = eventFucntions;
  }

  init() {
    this._eventFunctions.forEach((eventFunction) => {
      if (typeof window !== 'undefined') {
        window.addEventListener(this._eventType, eventFunction);
      }
    });
  }
}
