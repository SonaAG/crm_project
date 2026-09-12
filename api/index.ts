import express from 'express';
import cors from 'cors';
import {
  initDb,
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addNote,
  getStats,
  resetToSampleData
} from '../server/db';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDb();

// Ticket Routes
app.get('/api/tickets', (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const tickets = getTickets({
      status: status as string,
      priority: priority as string,
      category: category as string,
      search: search as string,
    });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
});

app.get('/api/tickets/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

app.get('/api/tickets/:id', (req, res) => {
  try {
    const ticket = getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
  }
});

app.post('/api/tickets', (req, res) => {
  try {
    const { title, description, customer_name, customer_email, category, priority } = req.body;
    if (!title || !description || !customer_name || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newTicket = createTicket(req.body);
    res.status(201).json(newTicket);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create ticket' });
  }
});

app.put('/api/tickets/:id', (req, res) => {
  try {
    const updated = updateTicket(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update ticket' });
  }
});

app.delete('/api/tickets/:id', (req, res) => {
  try {
    const success = deleteTicket(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete ticket' });
  }
});

app.post('/api/tickets/:id/notes', (req, res) => {
  try {
    const { author, body, is_internal } = req.body;
    if (!author || !body) {
      return res.status(400).json({ error: 'Author and note body are required' });
    }
    const note = addNote(req.params.id, { author, body, is_internal: !!is_internal });
    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add note' });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    resetToSampleData();
    res.json({ message: 'Database reset to sample data successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset database' });
  }
});


export default app;