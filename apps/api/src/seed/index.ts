import { Types } from 'mongoose';
import {
  AiReportModel,
  AlertSubscriptionModel,
  ApplicationModel,
  IpoModel,
  PanModel,
  SubscriptionSnapshotModel,
  UserModel,
} from '../models';
import { buildSeedData } from './seed-data';

const oid = (id: string) => new Types.ObjectId(id);

/**
 * Replaces the IPO data (ipos, subscriptionSnapshots, aiReports) with fresh seed data and
 * makes sure every collection has its indexes. User collections are left alone.
 */
export async function seedDatabase(now: Date = new Date()) {
  const data = buildSeedData(now);

  await Promise.all(
    [IpoModel, SubscriptionSnapshotModel, AiReportModel, UserModel, PanModel, ApplicationModel, AlertSubscriptionModel].map(
      (m) => m.syncIndexes(),
    ),
  );

  await Promise.all([IpoModel.deleteMany({}), SubscriptionSnapshotModel.deleteMany({}), AiReportModel.deleteMany({})]);

  await IpoModel.insertMany(
    data.ipos.map((ipo) => ({ ...ipo, _id: oid(ipo._id), aiReportId: ipo.aiReportId ? oid(ipo.aiReportId) : undefined })),
  );
  await SubscriptionSnapshotModel.insertMany(data.snapshots.map((s) => ({ ...s, ipoId: oid(s.ipoId) })));
  await AiReportModel.insertMany(data.aiReports.map((r) => ({ ...r, _id: oid(r._id), ipoId: oid(r.ipoId) })));

  return { ipos: data.ipos.length, snapshots: data.snapshots.length, aiReports: data.aiReports.length };
}
