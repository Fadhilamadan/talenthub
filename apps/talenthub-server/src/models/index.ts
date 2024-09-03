import Organisation from './organisation.model';
import User from './user.model';

export type Models = {
  Organisation: typeof Organisation;
  User: typeof User;
};

const models: Models = {
  Organisation,
  User,
};

export default models;
