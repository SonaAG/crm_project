export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Note {
  id: number;
  ticket_id: string;
  note_text: string;
  created_at: string;
}

// Exactly what GET /api/tickets returns:
// [{ ticket_id, customer_name, subject, status, priority, created_at }]
export interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  priority?: TicketPriority;
  created_at: string;
}

// Exactly what GET /api/tickets/{ticket_id} returns:
// { ticket_id, customer_name, customer_email, subject, description, status, priority, notes }
export interface TicketDetail {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority?: TicketPriority;
  notes: Note[];
}

export interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
}

// Exactly what POST /api/tickets accepts:
// Body: { customer_name, customer_email, subject, description, priority, status }
export interface CreateTicketPayload {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}

// Returns: { ticket_id, created_at }
export interface CreateTicketResponse {
  ticket_id: string;
  created_at: string;
}

// Exactly what PUT /api/tickets/{ticket_id} accepts:
// Body: { status, priority, notes }
export interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: TicketPriority;
  notes?: string;
}

// Returns: { success: true, updated_at }
export interface UpdateTicketResponse {
  success: boolean;
  updated_at: string;
}

export interface FilterState {
  status: 'All' | TicketStatus;
  search: string;
}

export type ViewMode = 'list' | 'kanban';
export type NavTab = 'tickets';
