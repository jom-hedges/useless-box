import { Elysia } from "elysia";
import { toggleSwitch, getState } from "./state";
import { startStateWatcher } from "./loop";

const app =new Elysia()

app
    .get('/state', () => getState())
    .post('/toggle', () => toggleSwitch());



app.listen(3000)
console.log('Useless machine running on http://localhost:3000')
startStateWatcher();
