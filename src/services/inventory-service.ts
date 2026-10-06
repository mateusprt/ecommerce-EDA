import { InventoryRepository } from '../repositories/inventory-repository.js';
import { InventoryReservedEvent } from '../events/inventory-events.js';
import { EventPublisher } from '../events/event-publisher.js';

export interface InventoryItem {
  product_name: string;
  quantity: number;
}

export class InventoryService {
  private inventoryRepository = new InventoryRepository();
  private eventPublisher = new EventPublisher();

  async reserveStock(items: InventoryItem[]): Promise<void> {
    // Validações básicas
    if (!items || items.length === 0) {
      throw new Error('Lista de itens não pode estar vazia');
    }

    console.log(`📊 Atualizando estoque...`);

    for (const item of items) {
      // Validar item
      if (!item.product_name || item.quantity <= 0) {
        throw new Error('Item inválido');
      }

      // Verificar se produto existe
      const product = this.inventoryRepository.findByProductName(item.product_name);
      if (!product) {
        throw new Error(`Produto ${item.product_name} não encontrado`);
      }

      // Verificar estoque disponível
      if (product.quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.product_name}. Disponível: ${product.quantity}, Solicitado: ${item.quantity}`);
      }

      const success = this.inventoryRepository.decreaseQuantity(item.product_name, item.quantity);
      if (!success) {
        throw new Error(`Falha ao reservar estoque para ${item.product_name}`);
      }
      const remaining = product.quantity - item.quantity;
      const event = new InventoryReservedEvent(item.product_name, item.quantity, remaining);
      await this.eventPublisher.publish(event);
    }
    console.log(`✓ Estoque atualizado`);
  }
}