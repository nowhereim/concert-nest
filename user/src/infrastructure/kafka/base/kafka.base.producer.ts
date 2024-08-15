import { OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Admin } from 'kafkajs';
import { kafkaConfig } from './kafka.config';

export abstract class KafkaBaseProducer implements OnModuleInit {
  protected admin: Admin;
  protected producer: Producer;
  protected topics: string[];

  constructor() {
    const kafka = new Kafka(kafkaConfig);

    this.admin = kafka.admin();
    this.producer = kafka.producer();
    this.setTopics();
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.admin.connect();
  }

  abstract setTopics(): void;

  protected sendMessage(topic: string, key: string, message: any) {
    const send = this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(message) }],
    });
    return send;
  }
}
