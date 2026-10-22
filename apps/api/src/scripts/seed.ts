import mongoose from 'mongoose';
import { env } from '../env';
import { seedDatabase } from '../seed';

if (env.NODE_ENV === 'production') {
  console.error('Refusing to seed a production database.');
  process.exit(1);
}

await mongoose.connect(env.MONGODB_URI);
try {
  const counts = await seedDatabase();
  console.log(`Seeded ${counts.ipos} IPOs, ${counts.snapshots} subscription snapshots, ${counts.aiReports} AI report(s).`);
} finally {
  await mongoose.disconnect();
}
