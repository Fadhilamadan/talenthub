import { gql } from 'apollo-server-express';

import organisationSchema from './organisation.schema';
import userSchema from './user.schema';

const linkSchema = gql`
  scalar DateTime

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export default [linkSchema, organisationSchema, userSchema];
