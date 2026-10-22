import { COLLECTIONS, type PanRecord } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Stored } from './helpers';

export type PanDoc = Stored<PanRecord, 'userId'>;

// Never holds a plain PAN: panEnc is ciphertext, panHash an HMAC (SPEC: Compliance).
const panSchema = new Schema<PanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true, trim: true, maxlength: 30 },
    panEnc: { type: String, required: true, select: false },
    panLast4: { type: String, required: true, match: /^\d{3}[A-Z]$/ },
    panHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// One user cannot save the same PAN twice.
panSchema.index({ userId: 1, panHash: 1 }, { unique: true });

export const PanModel = (mongoose.models.Pan as Model<PanDoc> | undefined) ?? model<PanDoc>('Pan', panSchema, COLLECTIONS.pans);
