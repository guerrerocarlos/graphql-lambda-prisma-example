import { pubSub, withFilter } from "../lambda";

type MessageType = 'greeting' | 'test';

type Message = {
  text: string;
  type: MessageType;
};

type SendMessageArgs = {
  text: string;
  type: MessageType;
};

export const typeDefs = /* GraphQL */ `
  enum MessageType {
    greeting
    test
  }
  type Message {
    id: ID!
    text: String!
    type: MessageType!
  }
  type Mutation {
    sendMessage(text: String!, type: MessageType = greeting): Message!
  }
  type Query {
    serverTime: Float!
  }
  type Subscription {
    messageFeed(type: MessageType): Message!
  }
`;

export const resolvers = {
  Mutation: {
    async sendMessage(ctx: any, { text, type }: SendMessageArgs) {
      const payload: Message = { text, type };

      await pubSub.publish('NEW_MESSAGE', payload);

      return payload;
    },
  },
  Query: {
    serverTime: () => Date.now(),
  },
  Subscription: {
    messageFeed: {
      resolve: (rootValue: Message) => {
        // root value is the payload from sendMessage mutation
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('NEW_MESSAGE'),
        (rootValue: Message, args: { type: null | MessageType }) => {
          // this can be async too :)
          if (args.type == null) {
            return true;
          }

          return args.type === rootValue.type;
        },
      ),
    },
  },
};
