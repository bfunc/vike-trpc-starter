import 'dotenv/config';
import { getDb } from './db';

const db = getDb();

const existingCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

if (existingCount.count === 0) {
	const now = new Date().toISOString();
	const insert = db.prepare(
		`
			INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`
	);

	const rows: Array<[string, string, 'admin' | 'editor' | 'viewer', string | null, number]> = [
		['Avery Stone', 'avery.stone@example.com', 'admin', 'Operations', 1],
		['Riley Chen', 'riley.chen@example.com', 'editor', 'Finance', 1],
		['Jordan Patel', 'jordan.patel@example.com', 'viewer', 'Support', 0],
		['Taylor Kim', 'taylor.kim@example.com', 'editor', 'People Ops', 1]
	];

	const seed = db.transaction(() => {
		for (const [name, email, role, department, isActive] of rows) {
			insert.run(name, email, role, department, isActive, now, now);
		}
	});

	seed();
	console.log(`[seed] inserted ${rows.length} users`);
} else {
	console.log(`[seed] skipped: users table already has ${existingCount.count} rows`);
}
