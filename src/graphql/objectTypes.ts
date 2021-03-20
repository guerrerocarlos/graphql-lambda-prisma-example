import {
  intArg,
  objectType,
  stringArg,
  nonNull,
  subscriptionType,
  extendType,
} from "nexus";

import { pubSub, withFilter } from "../lambda";

type Message = {
  message: string;
  type: string;
};

type Payment = {
  account: string;
  amount: number;
};

export const Servertime = objectType({
  name: "Servertime",
  definition(t) {
    t.string("seconds");
    t.string("time");
    t.string("region");
    t.string("timezone");
  },
});

export const Payment = objectType({
  name: "Payment",
  definition(t) {
    t.nonNull.string("account");
    t.int("amount");
  },
});

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.string("message");
    t.string("type");
  },
});

export const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.field("serverTime", {
      type: Servertime,
      resolve: async () => {
        return {
          seconds:  new Date().getTime(),
          time: new Date().toString(),
          region: process.env.AWS_REGION,
          timezone: process.env.TZ,
        };
      },
    });
  },
});

export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.nonNull.field("sendMessage", {
      type: Message,
      args: {
        message: nonNull(stringArg()),
        type: stringArg(),
      },
      async resolve(_root, args) {
        const payload: Message = {
          message: args.message,
          type: args.type,
        };
        await pubSub.publish("NEW_MESSAGE", payload);
        return payload;
      },
    });
  },
});

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("sendPayment", {
      type: "Payment",
      args: {
        account: nonNull(stringArg()),
        amount: nonNull(intArg()),
      },
      async resolve(_root, args) {
        const payload: Payment = {
          account: args.account,
          amount: args.amount,
        };
        await pubSub.publish("NEW_PAYMENT", payload);
        return payload;
      },
    });
  },
});

export const Subscriptions = subscriptionType({
  definition(t) {
    t.field("paymentsFeed", {
      type: Payment,
      args: {
        account: stringArg(),
      },
      subscribe: withFilter(
        pubSub.subscribe("NEW_PAYMENT"),
        (rootValue: Payment, args: { account: string }) => {
          if (args.account == null) {
            return true;
          }
          return args.account === rootValue.account;
        }
      ),
      resolve: (rootValue: Payment) => {
        return rootValue;
      },
    });
    t.field("messagesFeed", {
      type: Message,
      args: {
        type: stringArg(),
      },
      subscribe: withFilter(
        pubSub.subscribe("NEW_MESSAGE"),
        (rootValue: Message, args: { type: string }) => {
          if (args.type == null) {
            return true;
          }
          return args.type === rootValue.type;
        }
      ),
      resolve: (rootValue: Message) => {
        return rootValue;
      },
    });
  },
});
