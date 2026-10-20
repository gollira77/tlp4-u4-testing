import express from 'express';
import { calcularPrecioFinal } from './services/precios.ts';

export const app = express();
app.use(express.json());

app.get('/healthy', (_req, res) => {
  res.json({ estado: 'ok' });
});

app.post('/api/precios/calcular', (req, res) => {
  const { precio, descuento } = req.body ?? {};
  try {
    const total = calcularPrecioFinal(precio, descuento);
    res.status(200).json({ total });
  } catch (error) {
    if (error instanceof RangeError || error instanceof TypeError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Error interno' });
  }
});
