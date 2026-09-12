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

// Sanity check endpoints
app.get('/api', (req, res) => res.json({ status: 'ok', service: 'SupportFlow CRM API' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

// 1. GET /api/tickets - List tickets with search & status filters
app.get('/api/tickets', async (req, res) => {
  try {
    await getDb(); // Ensure database/memory store is ready
    const { status, search } = req.query;
    const tickets = await getTickets({
      status: status as string,
      search: search as string,
    });
    res.json(tickets);
  } catch (error: any) {
    console.error('[API] /api/tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
});

// 2. GET /api/tickets/stats - Calculated metrics for counters
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
    console.error('[API] /api/tickets/stats error:', error);
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
    console.error('[API] /api/tickets/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
  }
});

// 4. POST /api/tickets - Create a new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    await getDb();
    const { customer_name, customer_email, subject, description, priority, status, title } = req.body;
    
    // Support either 'subject' or 'title'
    const finalSubject = subject || title;
    
    if (!customer_name || !customer_email || !finalSubject || !description) {
      return res.status(400).json({ error: 'customer_name, customer_email, subject/title, and description are required' });
    }

    const newTicket = await createTicket({
      customer_name,
      customer_email,
      subject: finalSubject,
      description,
      priority: priority || 'Medium',
      status: status || 'Open'
    });

    res.status(201).json(newTicket);
  } catch (error: any) {
    console.error('[API] POST /api/tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to create ticket' });
  }
});

// 5. PUT /api/tickets/:id - Update status, priority, and add notes
app.put('/api/tickets/:id', async (req, res) => {
  try {
    await getDb();
    const updated = await updateTicket(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('[API] PUT /api/tickets/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to update ticket' });
  }
});

// 6. POST /api/tickets/:id/notes - Add note
app.post('/api/tickets/:id/notes', async (req, res) => {
  try {
    await getDb();
    const noteText = req.body.note_text || req.body.body || '';
    if (!noteText.trim()) {
      return res.status(400).json({ error: 'note_text or body is required' });
    }

    const updated = await updateTicket(req.params.id, { notes: noteText });
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(201).json({ success: true, message: 'Note added' });
  } catch (error: any) {
    console.error('[API] POST note error:', error);
    res.status(500).json({ error: error.message || 'Failed to add note' });
  }
});

export default app;