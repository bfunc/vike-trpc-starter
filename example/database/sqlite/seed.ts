import 'dotenv/config';
import { getDb } from './db';

const db = getDb();

db.exec('DELETE FROM users');

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations', 'Finance'];

type Role = 'admin' | 'editor' | 'viewer';

const users: Array<{
  name: string;
  email: string;
  role: Role;
  department: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}> = [
  { name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'admin', department: 'Engineering', is_active: 1, created_at: '2023-03-01T09:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' },
  { name: 'Bob Martinez', email: 'bob.martinez@company.com', role: 'admin', department: 'Product', is_active: 1, created_at: '2023-04-10T08:30:00.000Z', updated_at: '2024-02-20T11:00:00.000Z' },
  { name: 'Carol White', email: 'carol.white@company.com', role: 'admin', department: 'Operations', is_active: 1, created_at: '2023-05-15T07:45:00.000Z', updated_at: '2024-03-01T09:30:00.000Z' },
  { name: 'David Chen', email: 'david.chen@company.com', role: 'editor', department: 'Engineering', is_active: 1, created_at: '2023-06-01T10:00:00.000Z', updated_at: '2024-01-10T08:00:00.000Z' },
  { name: 'Eva Rodriguez', email: 'eva.rodriguez@company.com', role: 'editor', department: 'Design', is_active: 1, created_at: '2023-06-20T11:15:00.000Z', updated_at: '2024-02-05T12:00:00.000Z' },
  { name: 'Frank Kim', email: 'frank.kim@company.com', role: 'editor', department: 'Marketing', is_active: 1, created_at: '2023-07-05T09:00:00.000Z', updated_at: '2024-03-10T10:30:00.000Z' },
  { name: 'Grace Lee', email: 'grace.lee@company.com', role: 'editor', department: 'Engineering', is_active: 1, created_at: '2023-07-18T08:00:00.000Z', updated_at: '2024-01-25T09:00:00.000Z' },
  { name: 'Henry Park', email: 'henry.park@company.com', role: 'editor', department: 'Finance', is_active: 0, created_at: '2023-08-01T10:30:00.000Z', updated_at: '2024-02-14T11:00:00.000Z' },
  { name: 'Iris Thompson', email: 'iris.thompson@company.com', role: 'editor', department: 'Product', is_active: 1, created_at: '2023-08-15T09:15:00.000Z', updated_at: '2024-03-05T08:30:00.000Z' },
  { name: 'James Wilson', email: 'james.wilson@company.com', role: 'editor', department: 'Design', is_active: 1, created_at: '2023-09-01T07:30:00.000Z', updated_at: '2024-01-30T10:00:00.000Z' },
  { name: 'Karen Davis', email: 'karen.davis@company.com', role: 'viewer', department: 'Marketing', is_active: 1, created_at: '2023-09-10T11:00:00.000Z', updated_at: '2024-02-08T09:00:00.000Z' },
  { name: 'Liam Brown', email: 'liam.brown@company.com', role: 'viewer', department: 'Operations', is_active: 1, created_at: '2023-09-25T08:45:00.000Z', updated_at: '2024-03-12T11:30:00.000Z' },
  { name: 'Mia Garcia', email: 'mia.garcia@company.com', role: 'viewer', department: 'Finance', is_active: 1, created_at: '2023-10-05T10:00:00.000Z', updated_at: '2024-01-18T08:45:00.000Z' },
  { name: 'Noah Anderson', email: 'noah.anderson@company.com', role: 'viewer', department: 'Engineering', is_active: 0, created_at: '2023-10-20T09:30:00.000Z', updated_at: '2024-02-22T10:00:00.000Z' },
  { name: 'Olivia Taylor', email: 'olivia.taylor@company.com', role: 'viewer', department: 'Product', is_active: 1, created_at: '2023-11-01T08:00:00.000Z', updated_at: '2024-03-08T09:15:00.000Z' },
  { name: 'Paul Jackson', email: 'paul.jackson@company.com', role: 'viewer', department: 'Design', is_active: 1, created_at: '2023-11-15T11:30:00.000Z', updated_at: '2024-01-22T10:30:00.000Z' },
  { name: 'Quinn Harris', email: 'quinn.harris@company.com', role: 'viewer', department: 'Marketing', is_active: 1, created_at: '2023-12-01T07:00:00.000Z', updated_at: '2024-02-18T08:00:00.000Z' },
  { name: 'Rachel Clark', email: 'rachel.clark@company.com', role: 'viewer', department: 'Operations', is_active: 0, created_at: '2023-12-10T09:45:00.000Z', updated_at: '2024-03-15T09:00:00.000Z' },
  { name: 'Samuel Lewis', email: 'samuel.lewis@company.com', role: 'viewer', department: 'Finance', is_active: 1, created_at: '2024-01-05T10:15:00.000Z', updated_at: '2024-03-20T11:00:00.000Z' },
  { name: 'Tina Robinson', email: 'tina.robinson@company.com', role: 'viewer', department: 'Engineering', is_active: 1, created_at: '2024-01-20T08:30:00.000Z', updated_at: '2024-03-25T10:45:00.000Z' }
];

const stmt = db.prepare(`
  INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
  VALUES (@name, @email, @role, @department, @is_active, @created_at, @updated_at)
`);

const insertAll = db.transaction(() => {
  for (const user of users) {
    stmt.run(user);
  }
});

insertAll();
console.log(`[seed] inserted ${users.length} users`);
// suppress unused import warning
void departments;
