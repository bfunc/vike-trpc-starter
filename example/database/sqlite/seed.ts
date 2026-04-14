import 'dotenv/config';
import { getDb } from './db';

getDb();
console.log('[seed] no-op: no feature data to seed');
