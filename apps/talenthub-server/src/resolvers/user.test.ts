import jwt from 'jsonwebtoken';

import resolvers from './user.resolver';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
}));

describe('user', () => {
  const MOCK_TOKEN = 'mocked-jwt-token';

  let models: any;
  let jwtSecret: string;

  beforeEach(() => {
    jwtSecret = 'secret';

    models = {
      User: {
        create: jest.fn(),
        findByLogin: jest.fn(),
      },
    };

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a new user and return a token', async () => {
      const mockUser = {
        id: '1',
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        role: 'ADMIN',
      };
      models.User.create.mockResolvedValue(mockUser);

      const args = {
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        password: 'password',
      };

      expect(
        await resolvers.Mutation.signUp(null, args, { models, jwtSecret }),
      ).toEqual({ token: MOCK_TOKEN });

      expect(models.User.create).toHaveBeenCalledWith({
        name: args.name,
        email: args.email,
        password: args.password,
        role: 'ADMIN',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
        jwtSecret,
        { expiresIn: process.env.JWT_DURATION },
      );
    });

    it('should throw an error if the email already exists', async () => {
      models.User.create.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      const args = {
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        password: 'password',
      };

      await expect(
        resolvers.Mutation.signUp(null, args, { models, jwtSecret }),
      ).rejects.toThrow('User with this email already exists');

      expect(models.User.create).toHaveBeenCalledWith({
        name: args.name,
        email: args.email,
        password: args.password,
        role: 'ADMIN',
      });
    });

    it('should throw an error if there is a database failure', async () => {
      models.User.create.mockRejectedValue(new Error('Database failure'));

      const args = {
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        password: 'password',
      };

      await expect(
        resolvers.Mutation.signUp(null, args, { models, jwtSecret }),
      ).rejects.toThrow('Database failure');

      expect(models.User.create).toHaveBeenCalledWith({
        name: args.name,
        email: args.email,
        password: args.password,
        role: 'ADMIN',
      });
    });

    it.each([
      [
        {
          name: '',
          email: 'fadhil.amadan@mitrais.com',
          password: 'password123',
        },
        'Name is required',
      ],
      [
        {
          name: 'Fadhil Amadan',
          email: '',
          password: 'password123',
        },
        'Email is required',
      ],
      [
        {
          name: 'Fadhil Amadan',
          email: 'invalid-email',
          password: 'password123',
        },
        'Please enter a valid email address',
      ],
      [
        {
          name: 'Fadhil Amadan',
          email: 'fadhil.amadan@mitrais.com',
          password: '',
        },
        'Password is required',
      ],
    ])(
      'should throw an error if validation fails: %s',
      async (args, expectedError) => {
        await expect(
          resolvers.Mutation.signUp(null, args, { models, jwtSecret }),
        ).rejects.toThrow(expectedError);

        expect(models.User.create).not.toHaveBeenCalled();
      },
    );
  });

  describe('signIn', () => {
    it('should sign in a user and return a token', async () => {
      const mockUser = {
        id: '1',
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        role: 'ADMIN',
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      models.User.findByLogin.mockResolvedValue(mockUser);

      const args = { email: 'fadhil.amadan@mitrais.com', password: 'password' };

      expect(
        await resolvers.Mutation.signIn(null, args, { models, jwtSecret }),
      ).toEqual({ token: MOCK_TOKEN });

      expect(models.User.findByLogin).toHaveBeenCalledWith(args.email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(args.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
        jwtSecret,
        { expiresIn: process.env.JWT_DURATION },
      );
    });

    it('should throw an error if no user is found', async () => {
      models.User.findByLogin.mockResolvedValue(null);

      const args = { email: 'fadhil.amadan@mitrais.com', password: 'password' };

      await expect(
        resolvers.Mutation.signIn(null, args, { models, jwtSecret }),
      ).rejects.toThrow('No user found with this login credentials');

      expect(models.User.findByLogin).toHaveBeenCalledWith(args.email);
    });

    it('should throw an error if the password is invalid', async () => {
      const mockUser = {
        id: '1',
        name: 'Fadhil Amadan',
        email: 'fadhil.amadan@mitrais.com',
        role: 'ADMIN',
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      models.User.findByLogin.mockResolvedValue(mockUser);

      const args = { email: 'fadhil.amadan@mitrais.com', password: 'secret' };

      await expect(
        resolvers.Mutation.signIn(null, args, { models, jwtSecret }),
      ).rejects.toThrow('Invalid password');

      expect(mockUser.validatePassword).toHaveBeenCalledWith(args.password);
    });

    it.each([
      [
        {
          email: '',
          password: 'password123',
        },
        'Email is required',
      ],
      [
        {
          email: 'invalid-email',
          password: 'password123',
        },
        'Please enter a valid email address',
      ],
      [
        {
          email: 'fadhil.amadan@mitrais.com',
          password: '',
        },
        'Password is required',
      ],
      [
        {
          email: 'fadhil.amadan@mitrais.com',
          password: 'short',
        },
        'Password must be at least 6 characters long',
      ],
    ])(
      'should throw an error for invalid input: %s',
      async (args, expectedError) => {
        await expect(
          resolvers.Mutation.signIn(null, args, { models, jwtSecret }),
        ).rejects.toThrow(expectedError);

        expect(models.User.findByLogin).not.toHaveBeenCalled();
      },
    );
  });
});
