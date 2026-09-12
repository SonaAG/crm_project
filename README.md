# SupportFlow CRM — Customer Support Ticketing Web Application

A clean, production-ready Customer Support Ticketing CRM designed for engineering evaluation at **Datastraw Technologies**.

---

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js, CORS, and dotenv
- **Database**: SQLite (relational storage with zero external dependencies)
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React
- **Architecture**: Monorepo with Express backend serving REST API and compiled frontend

---

## 🗄️ Database Design (2 Tables)

The database schema is strictly scoped to 2 relational tables without unnecessary bloat:

### 1. `tickets` Table
| Column | Type | Constraints & Description |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `ticket_id` | TEXT | UNIQUE NOT NULL (auto-generated e.g. `TKT-001`, `TKT-002`) |
| `customer_name` | TEXT | NOT NULL |
| `customer_email` | TEXT | NOT NULL |
| `subject` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL |
| `status` | TEXT | NOT NULL DEFAULT `'Open'` (`'Open'`, `'In Progress'`, `'Closed'`) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 2. `notes` Table
| Column | Type | Constraints & Description |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `ticket_id` | TEXT | NOT NULL (Foreign key to `tickets.ticket_id`) |
| `note_text` | TEXT | NOT NULL |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

---

## 🚀 The 4 REST Endpoints

### 1. `POST /api/tickets`
Creates a new support ticket with status `'Open'` and an auto-incremented zero-padded ticket ID.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "customer_name": "Eleanor Vance",
    "customer_email": "eleanor.vance@enterprise-stack.io",
    "subject": "API webhook failing with repeated 500 Internal Error",
    "description": "Since deploy at 14:00 UTC, events dispatched to endpoint /v2/webhooks/checkout return 500 status code."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "ticket_id": "TKT-008",
    "created_at": "2026-09-12T09:39:55.431Z"
  }
  ```

---

### 2. `GET /api/tickets`
Lists all tickets with optional filtering by status and text search on customer name or subject.
- **Query Parameters**:
  - `status` *(optional)*: `'Open'`, `'In Progress'`, or `'Closed'`
  - `search` *(optional)*: Searches `customer_name`, `subject`, and `ticket_id`
- **Example Request**: `GET /api/tickets?status=Open&search=Eleanor`
- **Response (200 OK)**:
  ```json
  [
    {
      "ticket_id": "TKT-001",
      "customer_name": "Eleanor Vance",
      "subject": "API webhook failing with repeated 500 Internal Error",
      "status": "Open",
      "created_at": "2026-09-12T09:29:34.101Z"
    }
  ]
  ```

---

### 3. `GET /api/tickets/{ticket_id}`
Retrieves complete ticket details including all chronological notes logged for this ticket.
- **Example Request**: `GET /api/tickets/TKT-001`
- **Response (200 OK)**:
  ```json
  {
    "ticket_id": "TKT-001",
    "customer_name": "Eleanor Vance",
    "customer_email": "eleanor.vance@enterprise-stack.io",
    "subject": "API webhook failing with repeated 500 Internal Error",
    "description": "Since deploy at 14:00 UTC, events dispatched to endpoint /v2/webhooks/checkout return status 500 with \"Internal Database Transaction Deadlock\".",
    "status": "Open",
    "notes": [
      {
        "id": 1,
        "ticket_id": "TKT-001",
        "note_text": "Automation Bot escalated priority to Urgent triage queue.",
        "created_at": "2026-09-12T09:37:34.102Z"
      },
      {
        "id": 2,
        "ticket_id": "TKT-001",
        "note_text": "Investigated deadlocks on postgres checkout partition. Restarted worker pool #4.",
        "created_at": "2026-09-12T09:37:34.102Z"
      }
    ]
  }
  ```

---

### 4. `PUT /api/tickets/{ticket_id}`
Updates the ticket's status and/or logs a new activity note to the `notes` table.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "notes": "Investigated deadlocks on postgres checkout partition. Worker pool restarted."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "updated_at": "2026-09-12T09:40:00.002Z"
  }
  ```

---

## 🏃 Running the Project

```bash
# Install dependencies
npm install

# Start development server (Node.js Express + Vite HMR)
npm run dev

# Build for production (compiles React client to dist/ and backend to dist/server.cjs)
npm run build

# Start production server
npm start
```
