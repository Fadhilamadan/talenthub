import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    user(id: ID!): User!
    users: [User]
    me: User
  }

  extend type Mutation {
    signUp(name: String!, email: String!, password: String!): Token!
    signIn(email: String!, password: String!): Token!
  }

  input UserInput {
    name: String
    email: String
    password: String
    organisation: ID
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    organisation: ID
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Token {
    token: String!
  }

  enum UserRole {
    ADMIN
    USER
  }
`;
