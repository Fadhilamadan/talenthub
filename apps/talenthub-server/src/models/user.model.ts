import Joi from 'joi';
import { Schema, model } from 'mongoose';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  organisation?: Schema.Types.ObjectId; // IMPORTANT: referencing the associated organisation entity
};

export const userValidationSchema = Joi.object({
  name: Joi.string().optional().not(null).messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
  }),
  password: Joi.string().min(6).max(42).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 42 characters',
  }),
  role: Joi.string().optional().valid('ADMIN', 'USER').messages({
    'string.empty': 'Role is required',
    'any.only': 'Role must be either ADMIN or USER',
  }),
  organisation: Joi.string().optional(),
});

const UserSchema = new Schema<User>(
  {
    name: {
      type: Schema.Types.String,
      required: [true, 'Name is required'],
    },
    email: {
      type: Schema.Types.String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
      trim: true,
    },
    password: {
      type: Schema.Types.String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      maxlength: [42, 'Password cannot exceed 42 characters'],
    },
    role: {
      enum: {
        values: ['ADMIN', 'USER'],
        message: 'Role must be either ADMIN or USER',
      },
      default: 'USER',
      type: Schema.Types.String,
      required: [true, 'Role is required'],
      uppercase: true,
    },
    organisation: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
    },
  },
  { timestamps: true },
);

UserSchema.statics.findByLogin = async function (email: string) {
  const user = await this.findOne({ email });

  if (!user) {
    return null;
  }

  return user;
};

UserSchema.methods.validatePassword = async function (password: string) {
  return this.password === password;
};

const User = model<User>('User', UserSchema);

export default User;
