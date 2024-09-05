import { Schema, model } from 'mongoose';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  organisation?: Schema.Types.ObjectId; // IMPORTANT: referencing the associated organisation entity
};

const UserSchema = new Schema<User>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
      minlength: 7,
      maxlength: 42,
    },
    role: {
      enum: ['ADMIN', 'USER'],
      default: 'USER',
      type: Schema.Types.String,
      required: true,
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
