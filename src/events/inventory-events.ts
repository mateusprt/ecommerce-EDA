import { BaseEvent } from './base-event.js';

interface InventoryReservedData {
  productName: string;
  quantityReserved: number;
  remainingStock: number;
}

export class InventoryReservedEvent extends BaseEvent<InventoryReservedData> {
  readonly eventType = 'InventoryReserved';

  constructor(productName: string, quantityReserved: number, remainingStock: number) {
    super({
      productName,
      quantityReserved,
      remainingStock
    });
  }
}
