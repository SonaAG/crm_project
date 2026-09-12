import fs from 'fs';
import path from 'path';

export interface TicketRow {
  id: number;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
  updated_at: string;
}

export interface NoteRow {
  id: number;
  ticket_id: string;
  note_text: string;
  created_at: string;
}

export interface TicketListItem {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
}

export interface TicketDetailResponse {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  notes: NoteRow[];
}

// Detect serverless environments (Vercel, AWS Lambda)
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const DB_FILE = isServerless ? path.join('/tmp', 'crm.db') : path.join(process.cwd(), 'crm.db');

let dbInstance: any = null;
let useMemoryStore = isServerless; // On Vercel, immediately use resilient memory store

// In-memory tables for serverless / fallback
let memoryTickets: TicketRow[] = [];
let memoryNotes: NoteRow[] = [];
let initialized = false;

function persistDb() {
  if (useMemoryStore || !dbInstance) return;
  try {
    const data = dbInstance.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (err) {
    console.warn('[Database] Persist error (skipping write):', err);
  }
}

function initMemoryData() {
  const seedTickets = [
    {
      ticket_id: 'TKT-001',
      customer_name: 'Eleanor Vance',
      customer_email: 'eleanor.vance@enterprise-stack.io',
      subject: 'API webhook failing with repeated 500 Internal Error',
      description: 'Since deploy at 14:00 UTC, events dispatched to endpoint `/v2/webhooks/checkout` are returning status 500 with "Internal Database Transaction Deadlock". Multiple production client orders are pending retry.',
      status: 'Open' as const,
      priority: 'Urgent' as const,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      notes: [
        'Automation Bot escalated priority to Urgent triage queue.',
        'Investigated deadlocks on postgres checkout partition. Restarted worker pool #4 and traffic is stabilizing.'
      ]
    },
    {
      ticket_id: 'TKT-002',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.j@vertexlabs.io',
      subject: 'SSO authentication failing on SAML 2.0 endpoint',
      description: 'We updated our identity provider metadata this morning and now all single sign-on requests redirecting to https://auth.vertexlabs.io/saml/callback are failing with a 500 error code: invalid_assertion_signature.',
      status: 'Open' as const,
      priority: 'High' as const,
      created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notes: [
        'Checked Cloudflare logs on /saml/callback — incoming assertion contains a SHA-256 certificate thumbprint mismatch against cached key.'
      ]
    },
    {
      ticket_id: 'TKT-003',
      customer_name: 'David Chen',
      customer_email: 'd.chen@acmecloud.com',
      subject: 'Webhook delivery retry timeout occurring intermittently',
      description: 'Deliveries to our EU ingestion worker fail intermittently after 30s timeout. Looking at network trace, TLS handshake takes over 12s on specific edge nodes.',
      status: 'In Progress' as const,
      priority: 'High' as const,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      notes: [
        'Re-routed Frankfurt cluster edge proxies. Latency dropped down to 42ms.'
      ]
    },
    {
      ticket_id: 'TKT-004',
      customer_name: 'Elena Rostova',
      customer_email: 'elena@fintechscale.de',
      subject: 'Billing invoice mismatch on annual enterprise renewal',
      description: 'Finance department noticed the tax calculation on invoice #INV-2026-089 applies 21% VAT instead of 19% German statutory rate for reverse charge registered VAT IDs.',
      status: 'Open' as const,
      priority: 'Medium' as const,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      notes: []
    },
    {
      ticket_id: 'TKT-005',
      customer_name: 'Marcus Vance',
      customer_email: 'marcus.v@novatech.co',
      subject: 'Feature request: Bulk export tickets to BigQuery warehouse',
      description: 'We require a daily scheduled pipeline or webhooks pushing raw ticket mutation streams into GCP BigQuery for our business intelligence dashboards.',
      status: 'In Progress' as const,
      priority: 'Low' as const,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      notes: [
        'Shared our API documentation on cursor-based streaming endpoints. Scheduled customer demo for Friday.'
      ]
    },
    {
      ticket_id: 'TKT-006',
      customer_name: 'Aisha Patel',
      customer_email: 'aisha@globalretail.com',
      subject: 'Rate limit headers missing on /v1/customers endpoint',
      description: 'The response headers X-RateLimit-Limit and X-RateLimit-Remaining are missing on the customer batch API, causing rate limiter client to drop back to conservative polling.',
      status: 'Closed' as const,
      priority: 'Medium' as const,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      notes: [
        'Header middleware bug resolved in release v2.14.2. Verified with customer that headers are now visible.'
      ]
    },
    {
      ticket_id: 'TKT-007',
      customer_name: 'Tom Holland',
      customer_email: 'tom.h@spidersoft.org',
      subject: 'Mobile SDK crash on iOS device orientation toggle',
      description: 'When users rotate device while ticket submission modal is open, memory allocation spike causes crash in Thread #3 (Metal rendering queue).',
      status: 'Closed' as const,
      priority: 'High' as const,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      notes: [
        'Fixed view layout constraints in iOS SDK patch 3.8.1.'
      ]
    }
  ];

  memoryTickets = seedTickets.map((t, idx) => ({
    id: idx + 1,
    ticket_id: t.ticket_id,
    customer_name: t.customer_name,
    customer_email: t.customer_email,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    created_at: t.created_at,
    updated_at: t.updated_at
  }));

  let noteId = 1;
  memoryNotes = [];
  seedTickets.forEach((t) => {
    t.notes.forEach((text) => {
      memoryNotes.push({
        id: noteId++,
        ticket_id: t.ticket_id,
        note_text: text,
        created_at: t.updated_at
      });
    });
  });
  initialized = true;
}

export async function getDb(): Promise<any> {
  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Dynamic import to prevent crash in serverless/bundler environments
    const initSqlJsModule = await import('sql.js');
    const initSqlJs = (initSqlJsModule as any).default || initSqlJsModule;
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_FILE)) {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } else {
      dbInstance = new SQL.Database();
    }

    initSchema(dbInstance);
    return dbInstance;
  } catch (err) {
    console.warn('[Database] SQLite failed, falling back to in-memory store:', err);
    useMemoryStore = true;
    if (!initialized) initMemoryData();
    return null;
  }
}

function initSchema(db: any) {
  // TICKETS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      priority TEXT NOT NULL DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    db.run(`ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'Medium';`);
  } catch {
    // Column already exists
  }

  // NOTES TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
    );
  `);

  persistDb();

  const res = db.exec('SELECT COUNT(*) as count FROM tickets;');
  const count = res.length > 0 && res[0].values.length > 0 ? (res[0].values[0][0] as number) : 0;
  if (count === 0) {
    seedInitialData(db);
  }
}

export function seedInitialData(db: any) {
  initMemoryData();
  for (const t of memoryTickets) {
    db.run(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        t.ticket_id,
        t.customer_name,
        t.customer_email,
        t.subject,
        t.description,
        t.status,
        t.priority,
        t.created_at,
        t.updated_at
      ]
    );
  }

  for (const n of memoryNotes) {
    db.run(
      `INSERT INTO notes (ticket_id, note_text, created_at)
       VALUES (?, ?, ?);`,
      [n.ticket_id, n.note_text, n.created_at]
    );
  }

  persistDb();
}

/**
 * Generate next zero-padded ticket_id like TKT-001, TKT-002, etc.
 */
export async function getNextTicketId(): Promise<string> {
  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    let maxNum = 0;
    for (const t of memoryTickets) {
      const match = t.ticket_id.match(/TKT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    return `TKT-${String(maxNum + 1).padStart(3, '0')}`;
  }

  const db = await getDb();
  const res = db.exec('SELECT ticket_id FROM tickets;');
  let maxNum = 0;

  if (res.length > 0 && res[0].values) {
    for (const row of res[0].values) {
      const tid = String(row[0]);
      const match = tid.match(/TKT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `TKT-${String(nextNum).padStart(3, '0')}`;
}

/**
 * POST /api/tickets
 */
export async function createTicket(data: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: string;
  status?: string;
}): Promise<{ ticket_id: string; created_at: string }> {
  const ticketId = await getNextTicketId();
  const now = new Date().toISOString();

  const allowedStatuses = ['Open', 'In Progress', 'Closed'];
  const status = (data.status && allowedStatuses.includes(data.status) ? data.status : 'Open') as 'Open' | 'In Progress' | 'Closed';

  const allowedPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  const priority = (data.priority && allowedPriorities.includes(data.priority) ? data.priority : 'Medium') as 'Low' | 'Medium' | 'High' | 'Urgent';

  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    const newRow: TicketRow = {
      id: memoryTickets.length + 1,
      ticket_id: ticketId,
      customer_name: data.customer_name.trim(),
      customer_email: data.customer_email.trim(),
      subject: data.subject.trim(),
      description: data.description.trim(),
      status,
      priority,
      created_at: now,
      updated_at: now
    };
    memoryTickets.unshift(newRow);
    return { ticket_id: ticketId, created_at: now };
  }

  const db = await getDb();
  db.run(
    `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      ticketId,
      data.customer_name.trim(),
      data.customer_email.trim(),
      data.subject.trim(),
      data.description.trim(),
      status,
      priority,
      now,
      now
    ]
  );

  persistDb();

  return {
    ticket_id: ticketId,
    created_at: now
  };
}

/**
 * GET /api/tickets
 */
export async function getTickets(options: {
  status?: string;
  search?: string;
}): Promise<TicketListItem[]> {
  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    let list = [...memoryTickets];

    if (options.status && options.status !== 'All') {
      list = list.filter((t) => t.status.toLowerCase() === options.status!.toLowerCase());
    }

    if (options.search && options.search.trim().length > 0) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.customer_name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.ticket_id.toLowerCase().includes(q)
      );
    }

    return list.map((t) => ({
      ticket_id: t.ticket_id,
      customer_name: t.customer_name,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      created_at: t.created_at
    }));
  }

  const db = await getDb();
  let query = `
    SELECT 
      ticket_id, customer_name, subject, status, priority, created_at
    FROM tickets
    WHERE 1=1
  `;
  const params: string[] = [];

  if (options.status && options.status !== 'All') {
    query += ` AND status = ?`;
    params.push(options.status);
  }

  if (options.search && options.search.trim().length > 0) {
    const s = `%${options.search.trim()}%`;
    query += ` AND (customer_name LIKE ? OR subject LIKE ? OR ticket_id LIKE ?)`;
    params.push(s, s, s);
  }

  query += ` ORDER BY id DESC;`;

  const stmt = db.prepare(query);
  stmt.bind(params);

  const results: TicketListItem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      ticket_id: String(row.ticket_id),
      customer_name: String(row.customer_name),
      subject: String(row.subject),
      status: row.status as 'Open' | 'In Progress' | 'Closed',
      priority: (row.priority as 'Low' | 'Medium' | 'High' | 'Urgent') || 'Medium',
      created_at: String(row.created_at)
    });
  }
  stmt.free();

  return results;
}

/**
 * GET /api/tickets/{ticket_id}
 */
export async function getTicketById(ticketId: string): Promise<TicketDetailResponse | null> {
  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    const t = memoryTickets.find((item) => item.ticket_id.toLowerCase() === ticketId.toLowerCase());
    if (!t) return null;
    const notes = memoryNotes.filter((n) => n.ticket_id.toLowerCase() === t.ticket_id.toLowerCase());
    return {
      ticket_id: t.ticket_id,
      customer_name: t.customer_name,
      customer_email: t.customer_email,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      notes
    };
  }

  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?;`);
  stmt.bind([ticketId]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject();
  stmt.free();

  const notesStmt = db.prepare(`SELECT id, ticket_id, note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY id ASC;`);
  notesStmt.bind([ticketId]);
  const notes: NoteRow[] = [];
  while (notesStmt.step()) {
    const nRow = notesStmt.getAsObject();
    notes.push({
      id: Number(nRow.id),
      ticket_id: String(nRow.ticket_id),
      note_text: String(nRow.note_text),
      created_at: String(nRow.created_at)
    });
  }
  notesStmt.free();

  return {
    ticket_id: String(row.ticket_id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    subject: String(row.subject),
    description: String(row.description),
    status: row.status as 'Open' | 'In Progress' | 'Closed',
    priority: (row.priority as 'Low' | 'Medium' | 'High' | 'Urgent') || 'Medium',
    notes
  };
}

/**
 * PUT /api/tickets/{ticket_id}
 */
export async function updateTicket(
  ticketId: string,
  data: {
    status?: string;
    priority?: string;
    notes?: string;
  }
): Promise<{ success: boolean; updated_at: string } | null> {
  const now = new Date().toISOString();

  if (useMemoryStore) {
    if (!initialized) initMemoryData();
    const idx = memoryTickets.findIndex((t) => t.ticket_id.toLowerCase() === ticketId.toLowerCase());
    if (idx === -1) return null;

    if (data.status && ['Open', 'In Progress', 'Closed'].includes(data.status)) {
      memoryTickets[idx].status = data.status as 'Open' | 'In Progress' | 'Closed';
    }
    if (data.priority && ['Low', 'Medium', 'High', 'Urgent'].includes(data.priority)) {
      memoryTickets[idx].priority = data.priority as 'Low' | 'Medium' | 'High' | 'Urgent';
    }
    memoryTickets[idx].updated_at = now;

    if (data.notes && typeof data.notes === 'string' && data.notes.trim().length > 0) {
      memoryNotes.push({
        id: memoryNotes.length + 1,
        ticket_id: memoryTickets[idx].ticket_id,
        note_text: data.notes.trim(),
        created_at: now
      });
    }

    return { success: true, updated_at: now };
  }

  const db = await getDb();

  const checkStmt = db.prepare(`SELECT id FROM tickets WHERE ticket_id = ?;`);
  checkStmt.bind([ticketId]);
  const exists = checkStmt.step();
  checkStmt.free();

  if (!exists) {
    return null;
  }

  if (data.status && ['Open', 'In Progress', 'Closed'].includes(data.status)) {
    db.run(`UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?;`, [
      data.status,
      now,
      ticketId
    ]);
  }

  if (data.priority && ['Low', 'Medium', 'High', 'Urgent'].includes(data.priority)) {
    db.run(`UPDATE tickets SET priority = ?, updated_at = ? WHERE ticket_id = ?;`, [
      data.priority,
      now,
      ticketId
    ]);
  }

  if (!data.status && !data.priority) {
    db.run(`UPDATE tickets SET updated_at = ? WHERE ticket_id = ?;`, [now, ticketId]);
  }

  if (data.notes && typeof data.notes === 'string' && data.notes.trim().length > 0) {
    db.run(
      `INSERT INTO notes (ticket_id, note_text, created_at)
       VALUES (?, ?, ?);`,
      [ticketId, data.notes.trim(), now]
    );
  }

  persistDb();

  return {
    success: true,
    updated_at: now
  };
}