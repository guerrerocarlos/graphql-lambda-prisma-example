# Graphql Subscriptions on AWS Lambda (with Prisma) 

This is a [graphql-lambda](https://github.com/guerrerocarlos/graphql-lambda) module usage example that shows how to create a GraphQL endpoint with Subscriptions that stores new users using [prisma](https://prisma.io) ORM and shows the newly created users in real-time through a GraphQL subscription query,

# This example includes:

 * Prisma schemas definitions and client 
 * GraphQL SDL schemas definitions
 * `Subscription` queries implementation with Prisma module 

# How to

Deploy as usual with [serverless](https://serverles.com/) framework:

`serverless deploy`

# Playground Screenshots

Creating new users and receiving them in real time through `subscription` query:

![Screenshot 2021-04-05 at 2 39 52 AM](https://user-images.githubusercontent.com/82532/113528358-3de6f780-95b8-11eb-9d20-3f7000bb2e3d.jpg)

![Screenshot 2021-04-05 at 2 39 55 AM](https://user-images.githubusercontent.com/82532/113528362-42131500-95b8-11eb-8ca0-b390db97c1bd.jpg)

