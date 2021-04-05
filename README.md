# Prisma based Graphql Subscriptions on AWS Lambda 

This is a [graphql-lambda](https://github.com/guerrerocarlos/graphql-lambda) module usage example that shows how to create a GraphQL endpoint with Subscriptions that stores new users using [Prisma.io](https://prisma.io) and shows the receiving created users in real-time through a GraphQL subscription query,

# This example includes:

 * Prisma schemas definitions and client 
 * GraphQL SDL schemas definitions
 * Subscriptions with Prisma 

# How to

Deploy as usual with Serverles.com framework:

`serverless deploy`

# Playground Screenshots

Creating new users and receiving them in real time through subscription query:

![Playground using Subscriptions](https://user-images.githubusercontent.com/82532/113527161-8dc3bf80-95b4-11eb-8251-512b69d55336.jpg)

