import { app } from './app.ts';

const puerto = Number(process.env.PORT ?? 3000);
app.listen(puerto, () => {
  console.log(`API disponible en http://localhost:${puerto}`);
});
