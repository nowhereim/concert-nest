import { OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { kafkaConfig } from './kafka.config';
import { CustomLogger } from 'src/common/logger/logger';

export abstract class KafkaBaseConsumer implements OnModuleInit {
  private consumer: Consumer;
  private kafka: Kafka;
  private customLogger: CustomLogger;

  constructor(
    private readonly groupId: string,
    private readonly topic: string,
  ) {
    this.kafka = new Kafka(kafkaConfig);
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    this.customLogger = new CustomLogger();
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.topic,
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const parsedMessage = JSON.parse(message.value.toString());
        try {
          this.consumer.commitOffsets([
            { topic, partition, offset: message.offset },
          ]);
          await this.handleMessage(parsedMessage);
        } catch (e) {
          this.customLogger.logError(e);
          await this.consumer.commitOffsets([
            { topic, partition, offset: message.offset },
          ]);
          return e;
        }
      },
    });
  }

  abstract handleMessage(message: any): Promise<void>;
}
