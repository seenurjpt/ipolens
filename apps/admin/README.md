# IPOLens admin

Internal panel for fixing IPO data, reviewing AI reports before they go live, and running jobs.
It talks to the API's `/v1/admin` routes from the server only; the admin token never reaches the browser.

See the root README for setup. Settings come from the repo's root `.env`:

| Variable | Purpose |
| --- | --- |
| `API_URL` | API base URL (default `http://localhost:4000`) |
| `ADMIN_API_TOKEN` | Shared with the API; admin routes are off while unset |
| `ADMIN_USER`, `ADMIN_PASSWORD` | HTTP Basic login for the panel; required in production |
