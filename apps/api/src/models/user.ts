import { COLLECTIONS, DevicePlatform, type User } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Stored } from './helpers';

export type UserDoc = Stored<User>;

const userSchema = new Schema<UserDoc>(
  {
    firebaseUid: { type: String, required: true },
    phone: String,
    email: String,
    fcmTokens: {
      type: [
        new Schema(
          {
            token: { type: String, required: true },
            platform: { type: String, enum: DevicePlatform.options, required: true },
            updatedAt: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.index({ firebaseUid: 1 }, { unique: true });
// Lets the notifier drop a dead token without knowing its user (SPEC: Notifications).
userSchema.index({ 'fcmTokens.token': 1 });

export const UserModel = (mongoose.models.User as Model<UserDoc> | undefined) ?? model<UserDoc>('User', userSchema, COLLECTIONS.users);
