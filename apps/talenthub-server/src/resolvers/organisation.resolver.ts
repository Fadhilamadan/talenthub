import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from './authorization';
import type { Models } from '../models';
import type { Organisation } from '../models/organisation.model';
import type { User } from '../models/user.model';

export default {
  Query: {
    organisation: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        { id }: { id: string },
        { models }: { models: Models },
      ): Promise<Organisation> => {
        if (!id) {
          throw new Error('Organisation ID is required');
        }

        try {
          return await models.Organisation.findById(id);
        } catch (error) {
          throw new Error(`organisation: ${error}`);
        }
      },
    ),

    organisations: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        __: unknown,
        { models }: { models: Models },
      ): Promise<Organisation[]> => {
        try {
          return await models.Organisation.find();
        } catch (error) {
          throw new Error(`organisations: ${error}`);
        }
      },
    ),
  },

  Mutation: {
    createOrganisation: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        {
          organisationInput: { name, description, status },
        }: {
          organisationInput: {
            name: string;
            description: string;
            status: 'ACTIVE' | 'INACTIVE';
          };
        },
        { models, me }: { models: Models; me: User },
      ): Promise<Organisation> => {
        try {
          const createdOrganisation = await models.Organisation.create({
            name,
            description,
            status,
            user: me.id,
          });

          return await models.Organisation.findById(createdOrganisation._id)
            .populate('user')
            .exec();
        } catch (error) {
          throw new Error(`createOrganisation: ${error}`);
        }
      },
    ),

    editOrganisation: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        {
          id,
          organisationInput: { name, description, status },
        }: {
          id: string;
          organisationInput: {
            name: string;
            description: string;
            status: 'ACTIVE' | 'INACTIVE';
          };
        },
        { models }: { models: Models },
      ): Promise<Organisation> => {
        if (!id) {
          throw new Error('User ID is required');
        }

        try {
          const updatedOrganisation =
            await models.Organisation.findOneAndUpdate(
              { _id: id },
              { name, description, status },
              { runValidators: true },
            );

          if (!updatedOrganisation) {
            throw new Error('Organisation not found');
          }

          return await models.Organisation.findById(id).populate('user').exec();
        } catch (error) {
          throw new Error(`editOrganisation: ${error}`);
        }
      },
    ),

    deleteOrganisation: combineResolvers(
      isAuthenticated,
      async (
        _: unknown,
        { id }: { id: string },
        { models }: { models: Models },
      ): Promise<Boolean> => {
        if (!id) {
          throw new Error('User ID is required');
        }

        try {
          const deletedOrganisation =
            await models.Organisation.findByIdAndDelete({ _id: id });

          if (!deletedOrganisation) {
            throw new Error('Organisation not found');
          }

          return !!deletedOrganisation;
        } catch (error) {
          throw new Error(`deleteUser: ${error}`);
        }
      },
    ),
  },
};
