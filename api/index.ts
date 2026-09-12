import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// In-Memory Database Store (Self-contained for Vercel Serverless)
interface Ticket {
  id: number;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
  updated_at: string;
}

interface Note {
  id: number;
  ticket_id: string;
  note_text: string;
  body: string;
  author: string;
  created_at: string;
}

let tickets: Ticket[] = [
  {
    id: 1,
    ticket_id: 'TKT-001',
    customer_name: 'Eleanor Vance',
    customer_email: 'eleanor.vance@enterprise-stack.io',
    subject: 'API webhook failing with repeated 500 Internal Error',
    title: 'API webhook failing with repeated 500 Internal Error',
    description: 'Since deploy at 14:00 UTC, events dispatched to endpoint `/v2/webhooks/checkout` are returning status 500 with deadlock errors.',
    status: 'Open',
    priority: 'Urgent',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    ticket_id: 'TKT-002',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.j@vertexlabs.io',
    subject: 'SSO authentication failing on SAML 2.0 endpoint',
    title: 'SSO authentication failing on SAML 2.0 endpoint',
    description: 'We updated our identity provider metadata this morning and single sign-on is failing with invalid_assertion_signature.',
    status: 'Open',
    priority: 'High',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    ticket_id: 'TKT-003',
    customer_name: 'David Chen',
    customer_email: 'd.chen@acmecloud.com',
    subject: 'Webhook delivery retry timeout occurring intermittently',
    title: 'Webhook delivery retry timeout occurring intermittently',
    description: 'Deliveries to our EU ingestion worker fail intermittently after 30s timeout on specific Frankfurt nodes.',
    status: 'In Progress',
    priority: 'High',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    ticket_id: 'TKT-004',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@fintechscale.de',
    subject: 'Billing invoice mismatch on annual enterprise renewal',
    title: 'Billing invoice mismatch on annual enterprise renewal',
    description: 'Invoice #INV-2026-089 applies 21% VAT instead of 19% German statutory rate for reverse charge registered VAT IDs.',
    status: 'Open',
    priority: 'Medium',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    ticket_id: 'TKT-005',
    customer_name: 'Marcus Vance',
    customer_email: 'marcus.v@novatech.co',
    subject: 'Feature request: Bulk export tickets to BigQuery warehouse',
    title: 'Feature request: Bulk export tickets to BigQuery warehouse',
    description: 'We require a daily scheduled pipeline or webhooks pushing raw ticket mutation streams into GCP BigQuery.',
    status: 'In Progress',
    priority: 'Low',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    ticket_id: 'TKT-006',
    customer_name: 'Aisha Patel',
    customer_email: 'aisha@globalretail.com',
    subject: 'Rate limit headers missing on /v1/customers endpoint',
    title: 'Rate limit headers missing on /v1/customers endpoint',
    description: 'The response headers X-RateLimit-Limit and X-RateLimit-Remaining are missing on the customer batch API.',
    status: 'Closed',
    priority: 'Medium',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    ticket_id: 'TKT-007',
    customer_name: 'Tom Holland',
    customer_email: 'tom.h@spidersoft.org',
    subject: 'Mobile SDK crash on iOS device orientation toggle',
    title: 'Mobile SDK crash on iOS device orientation toggle',
    description: 'When users rotate device while ticket submission modal is open, memory allocation spike causes crash in Thread #3.',
    status: 'Closed',
    priority: 'High',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  }
];

let notes: Note[] = [
  {
    id: 1,
    ticket_id: 'TKT-001',
    note_text: 'Restarted worker pool #4. Latency stabilizing.',
    body: 'Restarted worker pool #4. Latency stabilizing.',
    author: 'DevOps Team',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', count: tickets.length });
});

// GET /api/tickets/stats
app.get('/api/tickets/stats', (req, res) => {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const in_progress = tickets.filter(t => t.status === 'In Progress').length;
  const closed = tickets.filter(t => t.status === 'Closed').length;
  const urgent = tickets.filter(t => t.priority === 'Urgent').length;

  res.json({
    total,
    open,
    in_progress,
    closed,
    urgent,
    avg_resolution_hours: 2.1
  });
});

// GET /api/tickets
app.get('/api/tickets', (req, res) => {
  try {
    const { status, search, priority } = req.query;
    let list = [...tickets];

    if (status && status !== 'All' && status !== 'all') {
      list = list.filter(t => t.status.toLowerCase() === String(status).toLowerCase());
    }

    if (priority && priority !== 'All' && priority !== 'all') {
      list = list.filter(t => t.priority.toLowerCase() === String(priority).toLowerCase());
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase();
      list = list.filter(t =>
        t.customer_name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.ticket_id.toLowerCase().includes(q)
      );
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching tickets' });
  }
});

// GET /api/tickets/:id
app.get('/api/tickets/:id', (req, res) => {
  const id = req.params.id.toLowerCase();
  const ticket = tickets.find(t => t.ticket_id.toLowerCase() === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  const ticketNotes = notes.filter(n => n.ticket_id.toLowerCase() === id);
  res.json({ ...ticket, notes: ticketNotes });
});

// POST /api/tickets
app.post('/api/tickets', (req, res) => {
  try {
    const { customer_name, customer_email, subject, title, description, priority, status } = req.body;
    const finalSubject = subject || title;

    if (!customer_name || !customer_email || !finalSubject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const nextId = tickets.length + 1;
    const ticket_id = `TKT-${String(nextId).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: nextId,
      ticket_id,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      subject: finalSubject.trim(),
      title: finalSubject.trim(),
      description: description.trim(),
      priority: (priority as any) || 'Medium',
      status: (status as any) || 'Open',
      created_at: now,
      updated_at: now
    };

    tickets.unshift(newTicket);
    res.status(201).json({ ticket_id, created_at: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating ticket' });
  }
});

// PUT /api/tickets/:id
app.put('/api/tickets/:id', (req, res) => {
  const id = req.params.id.toLowerCase();
  const idx = tickets.findIndex(t => t.ticket_id.toLowerCase() === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const now = new Date().toISOString();
  if (req.body.status) tickets[idx].status = req.body.status;
  if (req.body.priority) tickets[idx].priority = req.body.priority;
  tickets[idx].updated_at = now;

  const noteText = req.body.notes || req.body.note_text || req.body.body;
  if (noteText && typeof noteText === 'string' && noteText.trim()) {
    notes.push({
      id: notes.length + 1,
      ticket_id: tickets[idx].ticket_id,
      note_text: noteText.trim(),
      body: noteText.trim(),
      author: 'Support Agent',
      created_at: now
    });
  }

  res.json({ success: true, updated_at: now });
});

// POST /api/tickets/:id/notes
app.post('/api/tickets/:id/notes', (req, res) => {
  const id = req.params.id.toLowerCase();
  const ticket = tickets.find(t => t.ticket_id.toLowerCase() === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const noteText = req.body.body || req.body.note_text || '';
  if (!noteText.trim()) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const now = new Date().toISOString();
  const newNote: Note = {
    id: notes.length + 1,
    ticket_id: ticket.ticket_id,
    note_text: noteText.trim(),
    body: noteText.trim(),
    author: req.body.author || 'Agent',
    created_at: now
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

export default app;