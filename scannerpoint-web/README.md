# ScannerPoint web (frontend)

React 19 + Vite + React Router + axios. Plain CSS with one theme file (no Tailwind).
Every screen maps to an endpoint that exists in `../backend`; nothing else is included.

## Run

```bash
npm install
npm run dev
```

Opens on http://localhost:5173 (an origin the backend's CORS config allows).
The API base URL is in `.env` (`VITE_API_BASE_URL=http://localhost:8081/api`).
Start the backend from `../backend` with `mvn spring-boot:run`.

## Screens and the endpoints behind them

| Route | Screen | Backend endpoints | Roles |
|---|---|---|---|
| `/` | Landing page | — | public |
| `/login`, `/register` | Auth | `POST /auth/login`, `POST /auth/register` | public |
| `/overview` | Dashboard | reads the lists below that the role may see | any |
| `/customers` | Customers | `GET/POST /customers` | admin, receptionist (mechanic: view) |
| `/vehicles` | Vehicles | `GET /vehicles/customer/{id}`, `POST /vehicles` | admin, receptionist (mechanic: view) |
| `/appointments` | Appointments | `GET/POST /appointments`, `PATCH /appointments/{id}/status` | admin, receptionist (mechanic: view) |
| `/job-cards` | Job cards | `GET/POST /repairs/job-cards`, `PATCH /repairs/job-cards/{id}/status` | admin, receptionist, mechanic |
| `/inspections` | Inspections | `GET /inspections/vehicle/{id}`, `POST /inspections` | admin, mechanic (receptionist: view) |
| `/parts` | Spare parts | `GET/POST /spare-parts` | admin, storekeeper (mechanic: view) |
| `/stock` | Stock movements | `POST /inventory/restock`, `POST /inventory/dispense`, `GET /inventory/transactions` | admin, storekeeper (mechanic: dispense) |
| `/suppliers` | Suppliers | `GET/POST /suppliers` | admin, storekeeper |
| `/invoices` | Invoices & payments | `GET /invoices/customer/{id}`, `POST /invoices`, `POST /payments` | admin, receptionist |
| `/employees` | Employees | `GET/POST /employees`, `PUT /employees/{id}`, `PATCH /employees/{id}/active` | admin |
| `/payroll` | Payroll | `GET /salary-payments`, `POST /salary-payments/employee/{id}` | admin |
| `/reports` | Reports | `GET /reports/summary`, `GET /reports/employees` | admin |
| `/users` | User accounts | `GET /users` | admin |

The role rules live in `src/components/layout/nav.js` and mirror the backend's `@PreAuthorize` annotations.

## How the role is found

`POST /api/auth/login` returns only a message, so after login the app checks what the account may read:
`/users` (admin only), `/spare-parts/low-stock` (admin, storekeeper), `/customers` (admin, receptionist, mechanic)
and `/spare-parts` (admin, storekeeper, mechanic). That is enough to tell the four staff roles apart.
An account with only `ROLE_USER` sees a "no staff role yet" message.
If the backend later adds `GET /api/auth/me`, the app uses that instead.

## Structure

| Path | What |
|---|---|
| `src/styles/theme.css` | All colour, type, radius and motion tokens |
| `src/styles/ui.css` | Styles for the shared components |
| `src/components/ui/` | Button, Input, Card, Badge, StatCard, PageHeader, DataTable, ParticleField, Reveal, CountUp, icons |
| `src/components/layout/` | AppShell, Sidebar, AuthLayout, `nav.js` (menu + permissions) |
| `src/context/AuthContext.jsx` | Login, register, role lookup |
| `src/api/` | axios client, error messages, `useResource` (reads), `useAction` (writes) |
| `src/data/sample.js` | Sample rows for development preview mode only |
| `src/pages/` | One file per screen |

In development, the login page has "preview" buttons that open the app as a role with sample data and
no backend. Saving is disabled in preview, and the buttons are not included in production builds.

## Known backend limits the UI works around

- `CorsConfig` does not list `PATCH`, so status changes (appointments, job cards, employee active) are
  blocked by the browser until `"PATCH"` is added to `allowedMethods`.
- Error responses for logged-out requests come back as an empty 401, so a failed registration can only
  show a general message.
- There is no endpoint to list all vehicles or all invoices; both are listed per customer.
