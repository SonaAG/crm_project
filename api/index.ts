import express from 'express';
import cors from 'cors';
import {
  getDb,
  getTickets,
  getTicketById,
  createTicket,
  updateTicket
} from '../server/db';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 1. GET /api/tickets - List all tickets with optional search & status filter
app.get('/api/tickets', async (req, res) => {
  try {
    await getDb();
    const { status, search } = req.query;
    const tickets = await getTickets({
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(tickets);
  } catch (error: any) {
    console.error('[API Error /api/tickets]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
});

// 2. GET /api/tickets/stats - Summary statistics
app.get('/api/tickets/stats', async (req, res) => {
  try {
    await getDb();
    const tickets = await getTickets({});
    const total = tickets.length;
    const open = tickets.filter((t: any) => t.status === 'Open').length;
    const in_progress = tickets.filter((t: any) => t.status === 'In Progress').length;
    const closed = tickets.filter((t: any) => t.status === 'Closed').length;
    const urgent = tickets.filter((t: any) => t.priority === 'Urgent').length;

    res.json({
      total,
      open,
      in_progress,
      closed,
      urgent,
      avg_resolution_hours: 2.1
    });
  } catch (error: any) {
    console.error('[API Error /api/tickets/stats]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

// 3. GET /api/tickets/:id - Single ticket details
app.get('/api/tickets/:id', async (req, res) => {
  try {
    await getDb();
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error: any) {
    console.error('[API Error /api/tickets/:id]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
  }
});

// 4. POST /api/tickets - Create ticket
app.post('/api/tickets', async (req, res) => {
  try {
    await getDb();
    const { customer_name, customer_email, subject, description, priority, status } = req.body;
    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'Missing required ticket fields' });
    }

    const newTicket = await createTicket({
      customer_name,
      customer_email,
      subject,
      description,
      priority: priority || 'Medium',
      status: status || 'Open'
    });

    res.status(201).json(newTicket);
  } catch (error: any) {
    console.error('[API Error POST /api/tickets]:', error);
    res.status(500).json({ error: error.message || 'Failed to create ticket' });
  }
});

// 5. PUT /api/tickets/:id - Update ticket & add notes
app.put('/api/tickets/:id', async (req, res) => {
  try {
    await getDb();
    const updated = await updateTicket(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('[API Error PUT /api/tickets/:id]:', error);
    res.status(500).json({ error: error.message || 'Failed to update ticket' });
  }
});

export default app;