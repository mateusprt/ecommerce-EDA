import { randomUUID } from 'crypto';

export abstract class BaseEvent<T = any> {
  readonly eventId: string;
  abstract readonly eventType: string;
  readonly timestamp: Date;
  readonly payload: T;

  constructor(payload: T) {
    this.eventId = randomUUID();
    this.timestamp = new Date();
    this.payload = payload;
  }
}
