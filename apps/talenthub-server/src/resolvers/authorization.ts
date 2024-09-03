import { skip } from 'graphql-resolvers';

import type { Models } from '../models';
import type { User } from '../models/user.model';

export const isAuthenticated = (
  _: unknown,
  __: unknown,
  { models, me }: { models: Models; me: User }, // eslint-disable-line @typescript-eslint/no-unused-vars
) => (me ? skip : new Error('Not authenticated'));
