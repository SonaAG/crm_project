import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  getTickets,
  getTicketById,
  createTicket,
  updateTicket
} from './server/db.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'SupportFlow CRM API', timestamp: new Date().toISOString() });
});

/**
 * 1. POST /api/tickets
 * Body: { customer_name, customer_email, subject, description, priority, status }
 * Returns: { ticket_id, created_at }
 */
app.post('/api/tickets', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_email, subject, description, priority, status } = req.body;

    // Validate required fields and lengths
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      res.status(400).json({ error: 'customer_name is required' });
      return;
    }
    if (customer_name.trim().length > 150) {
      res.status(400).json({ error: 'customer_name must not exceed 150 characters' });
      return;
    }

    if (!customer_email || typeof customer_email !== 'string' || !customer_email.trim()) {
      res.status(400).json({ error: 'customer_email is required' });
      return;
    }
    if (customer_email.trim().length > 254) {
      res.status(400).json({ error: 'customer_email must not exceed 254 characters' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      res.status(400).json({ error: 'Valid customer_email is required' });
      return;
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      res.status(400).json({ error: 'subject is required' });
      return;
    }
    if (subject.trim().length > 250) {
      res.status(400).json({ error: 'subject must not exceed 250 characters' });
      return;
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'description is required' });
      return;
    }
    if (description.trim().length > 10000) {
      res.status(400).json({ error: 'description must not exceed 10,000 characters' });
      return;
    }

    if (priority && !['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      res.status(400).json({ error: "priority must be one of: 'Low', 'Medium', 'High', 'Urgent'" });
      return;
    }

    if (status && !['Open', 'In Progress', 'Closed'].includes(status)) {
      res.status(400).json({ error: "status must be one of: 'Open', 'In Progress', 'Closed'" });
      return;
    }

    const result = await createTicket({
      customer_name,
      customer_email,
      subject,
      description,
      priority,
      status
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * 2. GET /api/tickets
 * Query params: ?status=Open&search=customer_name (Optional)
 * Returns: [{ ticket_id, customer_name, subject, status, created_at }]
 */
app.get('/api/tickets', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const tickets = await getTickets({ status, search });
    // Guarantee exact contract: [{ ticket_id, customer_name, subject, status, created_at }]
    const formatted = tickets.map((t) => ({
      ticket_id: t.ticket_id,
      customer_name: t.customer_name,
      subject: t.subject,
      status: t.status,
      created_at: t.created_at
    }));
    res.json(formatted);
  } catch (err: any) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * 3. GET /api/tickets/:ticket_id
 * Returns: { ticket_id, customer_name, customer_email, subject, description, status, notes }
 */
app.get('/api/tickets/:ticket_id', async (req: Request, res: Response) => {
  try {
    const { ticket_id } = req.params;

    if (!ticket_id || !/^[A-Za-z0-9_-]{1,64}$/.test(ticket_id)) {
      res.status(400).json({ error: 'Invalid ticket_id format' });
      return;
    }

    const ticket = await getTicketById(ticket_id);

    if (!ticket) {
      res.status(404).json({ error: `Ticket '${ticket_id}' not found` });
      return;
    }

    // Guarantee exact contract: { ticket_id, customer_name, customer_email, subject, description, status, notes }
    res.json({
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      notes: ticket.notes
    });
  } catch (err: any) {
    console.error('Error fetching ticket details:', err);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});

/**
 * 4. PUT /api/tickets/:ticket_id
 * Body: { status, priority, notes }
 * Returns: { success: true, updated_at }
 */
app.put('/api/tickets/:ticket_id', async (req: Request, res: Response) => {
  try {
    const { ticket_id } = req.params;
    const { status, priority, notes } = req.body;

    if (!ticket_id || !/^[A-Za-z0-9_-]{1,64}$/.test(ticket_id)) {
      res.status(400).json({ error: 'Invalid ticket_id format' });
      return;
    }

    if (status && !['Open', 'In Progress', 'Closed'].includes(status)) {
      res.status(400).json({ error: "status must be one of: 'Open', 'In Progress', 'Closed'" });
      return;
    }

    if (priority && !['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      res.status(400).json({ error: "priority must be one of: 'Low', 'Medium', 'High', 'Urgent'" });
      return;
    }

    if (notes !== undefined && typeof notes !== 'string') {
      res.status(400).json({ error: 'notes must be a string' });
      return;
    }

    if (typeof notes === 'string' && notes.trim().length > 5000) {
      res.status(400).json({ error: 'notes must not exceed 5,000 characters' });
      return;
    }

    const result = await updateTicket(ticket_id, {
      status,
      priority,
      notes
    });

    if (!result) {
      res.status(404).json({ error: `Ticket '${ticket_id}' not found` });
      return;
    }

    res.json(result);
  } catch (err: any) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

async function startServer() {
  // Initialize Database on boot
  await getDb();
  console.log('[SQLite] 2-Table Database initialized (tickets, notes)');

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] SupportFlow CRM running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
