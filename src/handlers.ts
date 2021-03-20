import "source-map-support/register";

import { APIGatewayEvent, SQSEvent } from "aws-lambda";

import {
  Server,
  subscriptionManager,
  connectionManager,
  EventProcessor,
  APIGatewayWebSocketEvent,
  eventStore,
} from "./lambda";

import { typeDefs, resolvers } from "./graphql/schema";

const server = new Server({
  connectionManager,
  eventProcessor: new EventProcessor(),
  typeDefs,
  resolvers,
  // schema,
  subscriptionManager,
  onError: (err) => {
    console.log(err);
  },
  playground: {
    endpoint: `/${process.env.STAGE}/graphql`,
    subscriptionEndpoint: process.env.lambdaSubscriptionEndpoint,
  },
});

export const handleHttp = server.createHttpHandler();
export const handleWebSocket = server.createWebSocketHandler();
export const eventHandler = server.createEventHandler();

export async function handleGraphql(
  event: APIGatewayEvent | APIGatewayWebSocketEvent,
  context
) {
  if (
    (event as APIGatewayWebSocketEvent).requestContext != null &&
    (event as APIGatewayWebSocketEvent).requestContext.routeKey != null
  ) {
    await eventStore.publish(event);

    let result = {
      body: "",
      headers: event.headers?.["Sec-WebSocket-Protocol"]?.includes("graphql-ws")
        ? {
            "Sec-WebSocket-Protocol": "graphql-ws",
          }
        : undefined,
      statusCode: 200,
    };

    return result;
  } else if (
    (event as APIGatewayEvent).requestContext != null &&
    (event as APIGatewayEvent).requestContext.path != null
  ) {
    return handleHttp(event as APIGatewayEvent, context);
  } else {
    throw new Error("Invalid event");
  }
}

export async function handleGraphqlSubscriptions(event: SQSEvent, context) {
  if ((event as SQSEvent).Records != null) {
    for (const record of (event as SQSEvent).Records) {
      const ev = JSON.parse(record.body);
      if (
        (ev as APIGatewayWebSocketEvent).requestContext != null &&
        (ev as APIGatewayWebSocketEvent).requestContext.routeKey != null
      ) {
        await handleWebSocket(ev as APIGatewayWebSocketEvent, context);
      } else {
        await eventHandler(ev, context);
      }
    }
  } else {
    throw new Error("Invalid event");
  }
}
