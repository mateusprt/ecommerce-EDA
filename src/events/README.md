# Diretório de Eventos

Cada evento possui sua própria exchange (tipo: fanout).

---

## Estrutura Base

Todos os eventos estendem a classe `BaseEvent`:

```typescript
abstract class BaseEvent<T = any> {
  readonly eventId: string;        // UUID gerado automaticamente
  abstract readonly eventType: string;
  readonly timestamp: Date;        // Data/hora da criação
  readonly payload: T;             // Dados específicos do evento
}
```

**Características:**
- `eventId` é gerado automaticamente via `randomUUID()`
- `timestamp` é definido automaticamente no momento da criação
- `eventType` é definido em cada classe concreta
- `payload` contém os dados específicos tipados de cada evento

---

## Eventos de Pedido

### OrderCreated
**Exchange:** `OrderCreated`
**Quando:** Pedido criado com sucesso

**Payload:**
```typescript
{
  orderId: number
  customerName: string
  totalAmount: number
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}
```

**Exemplo de uso:**
```typescript
const event = new OrderCreatedEvent(
  orderId,
  customerName,
  totalAmount,
  items
);
```

---

### OrderCompleted
**Exchange:** `OrderCompleted`
**Quando:** Pedido finalizado (pagamento aprovado)

**Payload:**
```typescript
{
  orderId: number
  status: "paid"
}
```

**Exemplo de uso:**
```typescript
const event = new OrderCompletedEvent(orderId);
```

---

### OrderFailed
**Exchange:** `OrderFailed`
**Quando:** Pedido falhou (pagamento recusado ou outro erro)

**Payload:**
```typescript
{
  orderId: number
  status: "failed"
  reason: string
}
```

**Exemplo de uso:**
```typescript
const event = new OrderFailedEvent(orderId, "Payment declined");
```

**Motivos comuns:** `"Payment declined"`, `"Insufficient funds"`, `"Invalid card"`, `"Out of stock"`

---

## Eventos de Pagamento

### PaymentApproved
**Exchange:** `PaymentApproved`
**Quando:** Pagamento processado e aprovado com sucesso

**Payload:**
```typescript
{
  orderId: number
  paymentType: "credit" | "debit"
  amount: number
  message: string
}
```

**Exemplo de uso:**
```typescript
const event = new PaymentApprovedEvent(
  orderId,
  "credit",
  amount,
  "Payment approved successfully"
);
```

---

### PaymentDeclined
**Exchange:** `PaymentDeclined`
**Quando:** Falha no processamento do pagamento

**Payload:**
```typescript
{
  orderId: number
  paymentType: "credit" | "debit"
  amount: number
  reason: string
}
```

**Exemplo de uso:**
```typescript
const event = new PaymentDeclinedEvent(
  orderId,
  "credit",
  amount,
  "Insufficient funds"
);
```

**Motivos comuns:** `"Insufficient funds"`, `"Card expired"`, `"Invalid card"`, `"Fraud detected"`

---

## Eventos de Inventário

### InventoryReserved
**Exchange:** `InventoryReserved`
**Quando:** Estoque reservado para um pedido

**Payload:**
```typescript
{
  productName: string
  quantityReserved: number
  remainingStock: number
}
```

**Exemplo de uso:**
```typescript
const event = new InventoryReservedEvent(
  productName,
  quantityReserved,
  remainingStock
);
```

---

## Tabela de Referência Rápida

| Evento | Exchange | Classe | Domínio |
|--------|----------|--------|---------|
| OrderCreated | `OrderCreated` | `OrderCreatedEvent` | order |
| OrderCompleted | `OrderCompleted` | `OrderCompletedEvent` | order |
| OrderFailed | `OrderFailed` | `OrderFailedEvent` | order |
| PaymentApproved | `PaymentApproved` | `PaymentApprovedEvent` | payment |
| PaymentDeclined | `PaymentDeclined` | `PaymentDeclinedEvent` | payment |
| InventoryReserved | `InventoryReserved` | `InventoryReservedEvent` | inventory |

---

## Como Publicar Eventos

```typescript
import { EventPublisher } from './event-publisher.js';
import { OrderCreatedEvent } from './order-events.js';

const publisher = EventPublisher.getInstance();

// Criar o evento
const event = new OrderCreatedEvent(orderId, customerName, totalAmount, items);

// Publicar no RabbitMQ
await publisher.publish(event);
```

O `EventPublisher` usa a exchange com o nome do `eventType` de cada evento.
