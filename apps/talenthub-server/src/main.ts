import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import models from './models';
import resolvers from './resolvers';
import schema from './schemas'; // INFO: typeDefs

const app = express();

const getMe = async (req: any) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.JWT_SECRET); // IMPORTANT: must using await
    } catch (e) {
      throw new AuthenticationError('Your session expired.');
    }
  }
};

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<any> => {
        if (req) {
          return {
            models,
            me: await getMe(req),
            jwtSecret: process.env.JWT_SECRET,
          };
        }
      },
    }),
  );
};

startServer();

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB Connected');

  const port = process.env.TALENTHUB_SERVER_PORT || 3333;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/graphql`);
  });
  server.on('error', console.error);
});
