import { Elysia } from "elysia";

const app =new Elysia()
  .state("alive", false)
  .get("/", ({ store }) => ({
    // expose current value so it's visible in the browser
    alive: store.alive
  }))
  .post("/on", ({ store }) => {
    // any request can turn the switch on
    store.alive = true;
    return { message: "SWITCH turned ON"};
  })
  .listen(3000);

// start a single_interval that watches the flag
const INTERVAL_MS = 1_000;

const watcher = setInterval(() = > {
  // `app.store`  gives us the shared store object
  if (app.store.alive) {
    console.log("SWITCH is ON -> switching OFF");
    app.store.alive = false; // flips it back OFF
  } else {
    console.log("SWITCH is already OFF");
  }
}, INTERVAL_MS);

// cleans up on process exit 
process.on("SIGINT", () => {
  clearInterval(watcher);
  app.stop();
  console.log("慢走")；
  process.exit(0);
});



