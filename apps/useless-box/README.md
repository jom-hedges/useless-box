# USELESS-MACHINE
An environment to learn full-stack development, cloud development, and DevOps practices.

Initially built a single-record, event-reactive system with durable storage (DynamoDB),
local observers, and an I/O boundary.

## High-level Architecture
Configuration -> Pure-ish DynamoDB operations -> state life-cycle -> observation (polling/streaming) -> I/O  boundary (Elysia)

## Expectations
On application start, the Elysia boundary will check for a state record. If none exists, then it will create one. After that the program will listen for events. The expected event is a user on the client will click a button triggering a `POST - /toggle` which flips the state. The state change is detected with a `GET - /events` which streams live state updates to the front end. If the backend detects a state change, it logs that state change, then flips back to `OFF`.

### January 10, 2026
The issue was a routing and server-boundary mismatch. The application logic in the frontend was correctly issuing requests, but the Elysia instance that defined `/toggle` was not the same instance (or not in the right middleware order) as the one actually handling incoming HTTP traffic. It turns out that I still had a script in the frontt-end client that attempted to reach the `/events` endpoint, which also made a redundancy. When the static plugin was mounted incorrectly, it effectively shadowed or bypassed the API routes, causing /toggle to return a 404 even though the code existed. Fixing it required aligning one running server, one routing table, and correct middleware order, so that both static assets and API endpoints were registered on the same listening process — once that happened, the routes resolved correctly and everything worked as intended.

In the process of building this app, so far I have learned about: origin boundaries, HTTP routing, SSE lifecycles, HTMX semantics, and backed-driven state.

TODO:
- [ ] Replace polling with DynamoDB Streams -> push -> SSE
- [ ] EC2 deployments
    - [ ] Systemd service
    - [ ] env vars
    - [ ] security groups and better IAM practices
    - [ ] Nginx reverse proxy
- [ ] Observability
    - [ ] request logging
    - [ ] structured logs for state transitions
    - [ ] `/health' endpoint
- [ ] Multiple useless boxes
    - [ ] parameterize `pk`
    - [ ] multiple SSE Streams


