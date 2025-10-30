import { Elysia } from "elysia";
import { toggleSwitch, getState } from "./state";

const app =new Elysia()

app.get('/state', () => getState());
app.post('/toggle' () => toggleSwitch());

app.listen(3000)
console.log('Useless machine running on http://localhost:3000')
