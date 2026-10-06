import amqp from 'amqplib';
import { randomUUID } from 'crypto';
import { BaseEvent } from './base-event.js';
import { CONFIG } from '../config/constants.js';

export class EventPublisher {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  constructor(
    private readonly rabbitMqUrl: string = CONFIG.RABBITMQ_URL
  ) {}

  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando ao RabbitMQ...');

      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err: Error) => {
        console.error('❌ Erro na conexão RabbitMQ:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        console.log('🔌 Conexão RabbitMQ fechada');
        this.isConnected = false;
      });

      this.isConnected = true;
      console.log('✅ Conectado ao RabbitMQ com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao conectar ao RabbitMQ:', error);
      throw error;
    }
  }

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    // Conecta automaticamente se necessário
    if (!this.isConnected || !this.channel) {
      await this.connect();
    }

    // Adiciona eventId e timestamp se não existirem
    const completeEvent: BaseEvent = {
      ...event,
      eventId: event.eventId || randomUUID(),
      timestamp: event.timestamp || new Date(),
    };

    const exchangeName = completeEvent.eventType;

    try {
      await this.channel.assertExchange(exchangeName, 'fanout', {
        durable: true,
      });

      const published = this.channel.publish(
        exchangeName,
        '',
        Buffer.from(JSON.stringify(completeEvent)),
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          messageId: completeEvent.eventId,
          type: completeEvent.eventType,
        }
      );

      if (published) {
        console.log(`📤 Evento publicado: ${completeEvent.eventType} [${completeEvent.eventId}]`, {
          exchange: exchangeName,
        });
      } else {
        console.warn('⚠️ Buffer cheio, evento enfileirado internamente');
      }
    } catch (error) {
      console.error(`❌ Erro ao publicar evento ${completeEvent.eventType}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('✅ Desconectado do RabbitMQ');
    } catch (error) {
      console.error('❌ Erro ao desconectar do RabbitMQ:', error);
      throw error;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
