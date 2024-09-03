import { combineResolvers } from 'graphql-resolvers';
import jwt from 'jsonwebtoken';

import type { Models } from '../models';
import type { User } from '../models/user.model';
import { isAuthenticated } from './authorization';

const JWT_DURATION = process.env.JWT_DURATION;

const createToken = async (payload: object, jwtSecret: string) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: JWT_DURATION });
};

export default {
  Query: {
    user: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        { id }: { id: string },
        { models }: { models: Models },
      ): Promise<User> => {
        if (!id) {
          throw new Error('User ID is required');
        }

        try {
          return await models.User.findById(id);
        } catch (error) {
          throw new Error(`user: ${error}`);
        }
      },
    ),

    users: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        __: unknown,
        { models }: { models: Models },
      ): Promise<User[]> => {
        try {
          return await models.User.find();
        } catch (error) {
          throw new Error(`users: ${error}`);
        }
      },
    ),

    me: async (
      _: unknown,
      __: unknown,
      { models, me }: { models: Models; me: User },
    ): Promise<User> => {
      if (!me) {
        return null;
      }

      return models.User.findOne({ email: me.email });
    },
  },

  Mutation: {
    signIn: async (_: unknown, { email, password }, { models, jwtSecret }) => {
      const user = await models.User.findByLogin(email);

      if (!user) {
        throw new Error('No user found with this login credentials');
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      return {
        token: createToken({ email }, jwtSecret),
      };
    },
  },
};
