import { z } from 'zod';

/** The one BullMQ queue every job runs on. */
export const QUEUE_NAME = 'ipolens';

// Job names from SPEC "Data sources and ingestion jobs" > Job design.
export const JobName = z.enum([
  'discover-ipos',
  'enrich-ipo',
  'poll-subscription',
  'check-allotment-published',
  'listing-tracker',
  'status-transition',
  'ai-report',
]);
export type JobName = z.infer<typeof JobName>;

/** Jobs that act on one IPO and take its id. The rest sweep every relevant IPO. */
export const PER_IPO_JOBS: readonly JobName[] = ['enrich-ipo', 'ai-report'];

export const JOB_DESCRIPTIONS: Record<JobName, string> = {
  'discover-ipos': 'Find new and changed IPOs on NSE and BSE',
  'enrich-ipo': 'Fill details and download the DRHP/RHP for one IPO',
  'poll-subscription': 'Fetch live subscription for open IPOs',
  'check-allotment-published': 'Check registrars for published allotment',
  'listing-tracker': 'Record listing-day prices',
  'status-transition': 'Move IPOs through their statuses by date',
  'ai-report': 'Generate the analysis report for one IPO',
};
