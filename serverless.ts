import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "graphql-lambda-prisma-example",
  // frameworkVersion: '2',
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack"],
  // "plugins": [
  //   "serverless-plugin-typescript",
  // ],
  provider: {
    apiGateway: {
      shouldStartNameWithService: true,
    },
    name: "aws",
    runtime: "nodejs12.x",
    region: "eu-west-3",
    stage: "dev",
    memorySize: 512,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: ["sqs:*"],
            Resource: "*",
          },
        ],
      },
    },
    environment: {
      STAGE: "${opt:stage, self:provider.stage}",
      snsArn: {
        "Fn::Join": [
          "",
          [
            "arn:aws:sns:${self:custom.region}:",
            { Ref: "AWS::AccountId" },
            ":${self:custom.eventDispatchTopic}",
          ],
        ],
      },
      sqsfifo: {
        "Fn::Join": [
          "",
          [
            "https://sqs.",
            { Ref: "AWS::Region" },
            ".amazonaws.com/",
            { Ref: "AWS::AccountId" },
            "/${self:custom.eventSQSFifo}",
          ],
        ],
      },
      lambdaSubscriptionEndpoint: {
        "Fn::Join": [
          "",
          [
            "wss://",
            {
              Ref: "WebsocketsApi",
            },
            ".execute-api.",
            {
              Ref: "AWS::Region",
            },
            ".",
            {
              Ref: "AWS::URLSuffix",
            },
            "/${self:provider.stage}",
          ],
        ],
      },
    },
  },
  functions: {
    main: {
      handler: "src/handlers.handleGraphql",
      events: [
        {
          http: {
            path: "/graphql",
            method: "ANY",
          },
        },
        {
          websocket: {
            route: "$connect",
          },
        },
        {
          websocket: {
            route: "$default",
          },
        },
        {
          websocket: {
            route: "$disconnect",
          },
        },
      ],
    },
    queue: {
      handler: "src/handlers.handleGraphqlSubscriptions",
      events: [
        {
          sqs: {
            arn: {
              "Fn::GetAtt": ["sqsfifo", "Arn"],
            },
          },
        },
      ],
    },
  },
  custom: {
    stage: "${opt:stage, self:provider.stage}",
    region: "${opt:region, self:provider.region}",
    eventDispatchTopic: "${self:service}-event-dispatch-${self:custom.stage}",
    eventSQSFifo: "${self:service}-sqs-fifo-${self:custom.stage}.fifo",
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  resources: {
    Resources: {
      sqsfifo: {
        Properties: {
          QueueName: "${self:custom.eventSQSFifo}",
          FifoQueue: true,
          ContentBasedDeduplication: true,
        },
        Type: "AWS::SQS::Queue",
      },
    },
  },
};

module.exports = serverlessConfiguration;
