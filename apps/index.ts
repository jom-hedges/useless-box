import Bao from "baojs";

const app = new Bao();

app.get("/", (ctx) => {
  ctx.body = "Hello, World!";
});

app.post("/pretty", async (ctx) => {
    const json = await ctx.req.json();
    return ctx.sendPrettyJson(json);
});

app.listen();