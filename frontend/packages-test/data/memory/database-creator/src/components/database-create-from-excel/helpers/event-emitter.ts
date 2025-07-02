import { type Callback } from '../types';

class EventEmitter {
  private eventMap = new Map<string, Callback>();

  on(event: string, callback: Callback): void {
    this.eventMap.set(event, callback);
  }

  off(event: string): void {
    this.eventMap.delete(event);
  }

  getEventCallback(event: string): Callback | undefined {
    return this.eventMap.get(event);
  }

  emit(event: string): Promise<void> | void {
    return this.getEventCallback(event)?.() as any;
  }
}

export const eventEmitter = new EventEmitter();
