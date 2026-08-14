/**
 * Re-export seed data (backward compatible).
 * Prefer: `import { ... } from './seedData'` or `./locations`.
 */
export {
  mangroveLocations,
  ekosistemData,
  lingkunganData,
  tekananSosialData,
  timeSeriesData,
  alerts,
  kecamatanSummary,
  dataSources,
} from './seedData';
export type { DataSource } from './seedData';
