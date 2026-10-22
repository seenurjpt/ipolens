import mongoose, { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { seedDatabase } from '../seed';
import { useTestMongo } from '../test/mongo';
import { AiReportModel, ApplicationModel, IpoModel, PanModel, SubscriptionSnapshotModel } from '.';

useTestMongo();

describe('seedDatabase', () => {
  it('inserts the seed data and is safe to re-run', async () => {
    const first = await seedDatabase();
    const second = await seedDatabase();
    expect(second).toEqual(first);
    expect(await IpoModel.countDocuments()).toBe(6);
    expect(await SubscriptionSnapshotModel.countDocuments()).toBe(first.snapshots);
    expect(await AiReportModel.countDocuments({ published: true })).toBe(1);
  });

  it('creates the indexes from the spec', async () => {
    const keys = async (model: mongoose.Model<never>) =>
      (await model.collection.indexes()).map((i) => JSON.stringify(i.key));
    expect(await keys(IpoModel as never)).toEqual(
      expect.arrayContaining(['{"slug":1}', '{"status":1,"dates.close":1}', '{"board":1,"status":1}']),
    );
    expect(await keys(SubscriptionSnapshotModel as never)).toContain('{"ipoId":1,"at":-1}');
    expect(await keys(ApplicationModel as never)).toContain('{"userId":1,"ipoId":1,"panId":1}');
  });
});

describe('model validation', () => {
  it('rejects a duplicate slug', async () => {
    const existing = await IpoModel.findOne().lean();
    const { _id, ...copy } = existing!;
    void _id;
    await expect(IpoModel.create(copy)).rejects.toThrow(/duplicate key/);
  });

  it('rejects money that is not integer paise', async () => {
    const ipo = await IpoModel.findOne();
    ipo!.minInvestmentPaise = 1500.5;
    await expect(ipo!.validate()).rejects.toThrow(/integer number of paise/);
  });

  it('enforces one application per user, IPO and PAN', async () => {
    const ipo = await IpoModel.findOne().lean();
    const app = { userId: new Types.ObjectId(), ipoId: ipo!._id, panId: new Types.ObjectId(), category: 'RETAIL', lots: 1 };
    await ApplicationModel.create(app);
    await expect(ApplicationModel.create(app)).rejects.toThrow(/duplicate key/);
  });

  it('never selects the encrypted PAN by default', async () => {
    const userId = new Types.ObjectId();
    await PanModel.create({ userId, label: 'Self', panEnc: 'ciphertext', panLast4: '234F', panHash: 'hmac' });
    const pan = await PanModel.findOne({ userId }).lean();
    expect(pan).not.toHaveProperty('panEnc');
    expect(pan?.panLast4).toBe('234F');
  });
});
