import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const KEY = 'miSet';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const valores = await redis.smembers(KEY);
      return res.status(200).json(valores);
    }

    if (req.method === 'POST') {
      const valor = typeof req.body?.valor === 'string' ? req.body.valor.trim() : '';
      if (!valor || valor.length > 200) {
        return res.status(400).json({ error: 'Valor inválido (1 a 200 caracteres)' });
      }
      const agregado = await redis.sadd(KEY, valor); // 1 si es nuevo, 0 si ya existía
      return res.status(200).json({ ok: true, nuevo: agregado === 1 });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}