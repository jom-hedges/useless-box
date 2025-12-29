# USELESS-MACHINE

Initially built a single-record, event-reactive system with durable storage (DynamoDB),
local observers, and an I/O boundary.

## High-level Architecture
Configuration -> Pure-ish DynamoDB operations -> state life-cycle -> observation (polling/streaming) -> I/O  boundary (Elysia)
