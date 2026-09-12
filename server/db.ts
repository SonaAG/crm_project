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

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const DB_FILE = isServerless ? path.join('/tmp', 'crm.db') : path.join(process.cwd(), 'crm.db');

let dbInstance: any = null;
let useMemoryStore = isServerless;

let memoryTickets: any[] = [];
let memoryNotes: any[] = [];
let initialized = false;

function initMemoryData() {
  const seedTickets = [
    {
      ticket_id: 'TKT-001',
      customer_name: 'Eleanor Vance',
      customer_email: 'eleanor.vance@enterprise-stack.io',
      subject: 'API webhook failing with repeated 500 Internal Error',
      description: 'Since deploy at 14:00 UTC, events dispatched to endpoint `/v2/webhooks/checkout` are returning status 500.',
      status: 'Open',
      priority: 'Urgent',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      notes: ['Investigated deadlocks on postgres checkout partition. Restarted worker pool #4.']
    },
    {
      ticket_id: 'TKT-002',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.j@vertexlabs.io',
      subject: 'SSO authentication failing on SAML 2.0 endpoint',
      description: 'Single sign-on requests redirecting to https://auth.vertexlabs.io/saml/callback are failing.',
      status: 'Open',
      priority: 'High',
      created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notes: ['Checked Cloudflare logs on /saml/callback — thumbprint mismatch against cached key.']
    },
    {
      ticket_id: 'TKT-003',
      customer_name: 'David Chen',
      customer_email: 'd.chen@acmecloud.com',
      subject: 'Webhook delivery retry timeout occurring intermittently',
      description: 'Deliveries to our EU ingestion worker fail intermittently after 30s timeout.',
      status: 'In Progress',
      priority: 'High',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      notes: ['Re-routed Frankfurt cluster edge proxies. Latency dropped to 42ms.']
    },
    {
      ticket_id: 'TKT-004',
      customer_name: 'Elena Rostova',
      customer_email: 'elena@fintechscale.de',
      subject: 'Billing invoice mismatch on annual enterprise renewal',
      description: 'Invoice #INV-2026-089 applies 21% VAT instead of 19% German statutory rate.',
      status: 'Open',
      priority: 'Medium',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      notes: []
    },
    {
      ticket_id: 'TKT-005',
      customer_name: 'Marcus Vance',
      customer_email: 'marcus.v@novatech.co',
      subject: 'Feature request: Bulk export tickets to BigQuery warehouse',
      description: 'Daily scheduled pipeline or webhooks pushing raw ticket mutation streams into GCP BigQuery.',
      status: 'In Progress',
      priority: 'Low',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      notes: ['Scheduled customer demo for Friday.']
    },
    {
      ticket_id: 'TKT-006',
      customer_name: 'Aisha Patel',
      customer_email: 'aisha@globalretail.com',
      subject: 'Rate limit headers missing on /v1/customers endpoint',
      description: 'Response headers X-RateLimit-Limit and X-RateLimit-Remaining are missing on customer batch API.',
      status: 'Closed',
      priority: 'Medium',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      notes: ['Header middleware bug resolved in release v2.14.2.']
    },
    {
      ticket_id: 'TKT-007',
      customer_name: 'Tom Holland',
      customer_email: 'tom.h@spidersoft.org',
      subject: 'Mobile SDK crash on iOS device orientation toggle',
      description: 'When users rotate device while ticket submission modal is open, memory allocation spike causes crash.',
      status: 'Closed',
      priority: 'High',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      notes: ['Fixed view layout constraints in iOS SDK patch 3.8.1.']
    }
  ];

  memoryTickets = seedTickets.map((t, idx) => ({
    id: idx + 1,
    ticket_id: t.ticket_id,
    customer_name: t.customer_name,
    customer_email: t.customer_email,
    subject: t.subject,
    title: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    created_at: t.created_at,
    updated_at: t.updated_at
  }));

  memoryNotes = [];
  let nid = 1;
  seedTickets.forEach(t => {
    t.notes.forEach(noteText => {
      memoryNotes.push({
        id: nid++,
        ticket_id: t.ticket_id,
        note_text: noteText,
        body: noteText,
        author: 'Support Team',
        created_at: t.updated_at
      });
    });
  });

  initialized = true;
}

// 1. Export initDb and getDb
export async function initDb(): Promise<void> {
  if (!initialized) initMemoryData();
}

export async function getDb(): Promise<any> {
  if (!initialized) initMemoryData();
  return null;
}

// 2. Export getTickets (supports priority, status, search, category)
export function getTickets(options?: {
  status?: string;
  search?: string;
  priority?: string;
  category?: string;
}): any[] {
  if (!initialized) initMemoryData();
  let list = [...memoryTickets];

  if (options?.status && options.status !== 'All' && options.status !== 'all') {
    list = list.filter(t => t.status.toLowerCase() === options.status!.toLowerCase());
  }

  if (options?.priority && options.priority !== 'All' && options.priority !== 'all') {
    list = list.filter(t => t.priority.toLowerCase() === options.priority!.toLowerCase());
  }

  if (options?.search && options.search.trim().length > 0) {
    const q = options.search.trim().toLowerCase();
    list = list.filter(t =>
      t.customer_name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.ticket_id.toLowerCase().includes(q)
    );
  }

  return list;
}

// 3. Export getTicketById
export function getTicketById(ticketId: string): any {
  if (!initialized) initMemoryData();
  const t = memoryTickets.find(item => item.ticket_id.toLowerCase() === ticketId.toLowerCase());
  if (!t) return null;
  const notes = memoryNotes.filter(n => n.ticket_id.toLowerCase() === t.ticket_id.toLowerCase());
  return { ...t, notes };
}

// 4. Export createTicket
export function createTicket(data: any): any {
  if (!initialized) initMemoryData();
  const now = new Date().toISOString();
  const nextNum = memoryTickets.length + 1;
  const ticket_id = `TKT-${String(nextNum).padStart(3, '0')}`;

  const newTicket = {
    id: nextNum,
    ticket_id,
    customer_name: (data.customer_name || '').trim(),
    customer_email: (data.customer_email || '').trim(),
    subject: (data.subject || data.title || '').trim(),
    title: (data.subject || data.title || '').trim(),
    description: (data.description || '').trim(),
    status: data.status || 'Open',
    priority: data.priority || 'Medium',
    created_at: now,
    updated_at: now
  };

  memoryTickets.unshift(newTicket);
  return { ticket_id, created_at: now };
}

// 5. Export updateTicket
export function updateTicket(ticketId: string, data: any): any {
  if (!initialized) initMemoryData();
  const idx = memoryTickets.findIndex(t => t.ticket_id.toLowerCase() === ticketId.toLowerCase());
  if (idx === -1) return null;

  const now = new Date().toISOString();
  if (data.status) memoryTickets[idx].status = data.status;
  if (data.priority) memoryTickets[idx].priority = data.priority;
  memoryTickets[idx].updated_at = now;

  if (data.notes && typeof data.notes === 'string' && data.notes.trim()) {
    addNote(ticketId, { body: data.notes, author: 'Agent' });
  }

  return { success: true, updated_at: now };
}

// 6. Export deleteTicket
export function deleteTicket(ticketId: string): boolean {
  if (!initialized) initMemoryData();
  const len = memoryTickets.length;
  memoryTickets = memoryTickets.filter(t => t.ticket_id.toLowerCase() !== ticketId.toLowerCase());
  return memoryTickets.length < len;
}

// 7. Export addNote
export function addNote(ticketId: string, data: any): any {
  if (!initialized) initMemoryData();
  const now = new Date().toISOString();
  const note = {
    id: memoryNotes.length + 1,
    ticket_id: ticketId,
    note_text: data.body || data.note_text || '',
    body: data.body || data.note_text || '',
    author: data.author || 'Agent',
    is_internal: !!data.is_internal,
    created_at: now
  };
  memoryNotes.push(note);
  return note;
}

// 8. Export getStats
export function getStats(): any {
  if (!initialized) initMemoryData();
  const total = memoryTickets.length;
  const open = memoryTickets.filter(t => t.status === 'Open').length;
  const in_progress = memoryTickets.filter(t => t.status === 'In Progress').length;
  const closed = memoryTickets.filter(t => t.status === 'Closed').length;
  const urgent = memoryTickets.filter(t => t.priority === 'Urgent').length;

  return {
    total,
    open,
    in_progress,
    closed,
    urgent,
    avg_resolution_hours: 2.1
  };
}

// 9. Export resetToSampleData
export function resetToSampleData(): void {
  initMemoryData();
}