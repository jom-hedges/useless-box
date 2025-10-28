import { Bao } from 'bunjs';

const app = new Bao();

let isSwitchOn = true;


setInterval(() => {
  isSwitchOn = !isSwitchOn;
}, 1000);


app.get('/switch', (ctx) => {
  ctx.json({ isSwitchOn });
});

app.post('/switch/toggle', (ctx) => {
  isSwitchOn = !isSwitchOn;
  ctx.json({ isSwitchOn });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});