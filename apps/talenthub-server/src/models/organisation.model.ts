import { Schema, model } from 'mongoose';

export type Organisation = {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  user: Schema.Types.ObjectId; // IMPORTANT: referencing the associated user entity
};

const OrganisationSchema = new Schema<Organisation>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    status: {
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'INACTIVE',
      type: Schema.Types.String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Organisation = model<Organisation>('Organisation', OrganisationSchema);

export default Organisation;
