import { APIGatewayProxyEvent } from "aws-lambda";
import {
  PubSub,
  SubscriptionManager,
  ApiGatewayConnectionManager,
  ISubscriptionEvent,
  IEventStore,
  APIGatewayWebSocketEvent,
} from "graphql-lambda";
import { SQS } from "aws-sdk";

export class SQSQueue implements IEventStore {
  public events: ISubscriptionEvent[];
  private sqs: SQS;

  constructor() {
    this.sqs = new SQS();
  }

  publish = async (event: ISubscriptionEvent | APIGatewayProxyEvent | APIGatewayWebSocketEvent): Promise<void> => {
    var params = {
      QueueUrl: process.env.sqsfifo,
      MessageGroupId: "0",
      MessageBody: JSON.stringify(event),
    };
    await this.sqs.sendMessage(params).promise();
  };
}

export const eventStore = new SQSQueue();
export const pubSub = new PubSub({ eventStore });
export const subscriptionManager = new SubscriptionManager({
  subscriptionManagerStorage: new Map(),
});
export const connectionManager = new ApiGatewayConnectionManager({
  connectionManagerStorage: new Map(),
});
export * from "graphql-lambda";
