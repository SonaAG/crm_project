import {
  Ticket,
  TicketDetail,
  CreateTicketPayload,
  CreateTicketResponse,
  UpdateTicketPayload,
  UpdateTicketResponse
} from '../types.ts';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // Ignore JSON parse error on non-json response
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  /**
   * 1. GET /api/tickets?status=Open&search=customer_name
   * Returns: [{ ticket_id, customer_name, subject, status, created_at }]
   */
  async getTickets(params?: { status?: string; search?: string }): Promise<Ticket[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'All') {
      searchParams.set('status', params.status);
    }
    if (params?.search && params.search.trim().length > 0) {
      searchParams.set('search', params.search.trim());
    }

    const qs = searchParams.toString();
    const url = `${API_BASE}/tickets${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Ticket[]>(res);
  },

  /**
   * 2. GET /api/tickets/{ticket_id}
   * Returns: { ticket_id, customer_name, customer_email, subject, description, status, notes }
   */
  async getTicketById(ticketId: string): Promise<TicketDetail> {
    const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`);
    return handleResponse<TicketDetail>(res);
  },

  /**
   * 3. POST /api/tickets
   * Body: { customer_name, customer_email, subject, description }
   * Returns: { ticket_id, created_at }
   */
  async createTicket(payload: CreateTicketPayload): Promise<CreateTicketResponse> {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreateTicketResponse>(res);
  },

  /**
   * 4. PUT /api/tickets/{ticket_id}
   * Body: { status, notes }
   * Returns: { success: true, updated_at }
   */
  async updateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<UpdateTicketResponse> {
    const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<UpdateTicketResponse>(res);
  },
};
