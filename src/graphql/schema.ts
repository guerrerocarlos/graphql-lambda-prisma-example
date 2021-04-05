import { pubSub, withFilter } from "../lambda";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type MessageType = 'greeting' | 'test';

type Message = {
  text: string;
  type: MessageType;
};

type User = {
  email: string;
};

type SendMessageArgs = {
  text: string;
  type: MessageType;
};

type CreateUserArgs = {
  email: string;
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
  type User {
    email: String
  }
  type Mutation {
    sendMessage(text: String!, type: MessageType = greeting): Message!
    createUser(email: String!): User!
  }
  type Query {
    serverTime: Float!
  }
  type Subscription {
    messageFeed(type: MessageType): Message!
    usersFeed: User!
  }
`;

export const resolvers = {
  Mutation: {
    async sendMessage(ctx: any, { text, type }: SendMessageArgs) {
      const payload: Message = { text, type };

      await pubSub.publish("NEW_MESSAGE", payload);

      return payload;
    },
    async createUser(ctx: any, { email }: CreateUserArgs) {
      const user: User = await prisma.user.create({
        data: { email, birthDate: new Date() },
      });

      await pubSub.publish("NEW_USER", user);

      return user;
    },
  },
  Query: {
    serverTime: async () => {
      return (await prisma.user.findMany({})).length;
    },
  },
  Subscription: {
    messageFeed: {
      subscribe: withFilter(
        pubSub.subscribe("NEW_MESSAGE"),
        (rootValue: Message, args: { type: null | MessageType }) => {
          // this can be async too :)
          if (args.type == null) {
            return true;
          }
          return args.type === rootValue.type;
        }
      ),
      resolve: (rootValue: Message) => {
        // root value is the payload from sendMessage mutation
        return rootValue;
      },
    },
    usersFeed: {
      subscribe: pubSub.subscribe("NEW_USER"),
      resolve: (rootValue: Message) => {
        // root value is the payload from usersFeed mutation
        return rootValue;
      },
    },
  },
};
