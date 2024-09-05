import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    organisation(id: ID!): Organisation!
    organisations: [Organisation]
  }

  extend type Mutation {
    createOrganisation(organisationInput: OrganisationInput!): Organisation!
    editOrganisation(
      id: ID!
      organisationInput: OrganisationInput
    ): Organisation!
    deleteOrganisation(id: ID!): Boolean!
  }

  input OrganisationInput {
    name: String
    description: String
    status: String
  }

  type Organisation {
    id: ID!
    name: String!
    description: String!
    status: OrganisationStatus!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum OrganisationStatus {
    ACTIVE
    INACTIVE
  }
`;
