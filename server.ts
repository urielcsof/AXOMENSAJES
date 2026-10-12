import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse port from CLI args (--port 3000) or fallback to 3000
let PORT = 3000;
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  PORT = parseInt(process.argv[portArgIndex + 1], 10) || 3000;
}

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Endpoint: Generate Speech using gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      stylePrompt = 'Voz femenina, alegre, muy dinámica y efusiva, con tono apasionado, fresco y persuasivo de marketing viral',
      mode = 'single',
      dialogueParts = [],
    } = req.body;

    if (!text && (!dialogueParts || dialogueParts.length === 0)) {
      return res.status(400).json({ error: 'El texto es obligatorio para generar audio.' });
    }

    if (mode === 'dialogue' && Array.isArray(dialogueParts) && dialogueParts.length >= 2) {
      const speaker1Name = dialogueParts[0]?.speaker || 'Presentadora';
      const speaker2Name = dialogueParts[1]?.speaker || 'Cliente';

      const parts = dialogueParts.map((item: { speaker: string; text: string; style?: string }) => ({
        text: `${item.speaker}: ${item.text}`,
        speechMetadata: {
          speaker: item.speaker,
          style: item.style || (item.speaker === speaker1Name ? 'Voz femenina alegre, enérgica y dinámica' : 'Conversacional y reflexivo'),
        },
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
                {
                  speaker: speaker2Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Puck' },
                  },
                },
              ],
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart || !audioPart.data) {
        throw new Error('No se recibió audio del modelo de voz.');
      }

      return res.json({
        audio: audioPart.data,
        mimeType: audioPart.mimeType || 'audio/wav',
        voiceName,
        style: stylePrompt,
      });
    }

    // Single Speaker Mode
    const cleanText = String(text).trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!audioPart || !audioPart.data) {
      throw new Error('No se pudo generar el flujo de audio con Gemini TTS.');
    }

    return res.json({
      audio: audioPart.data,
      mimeType: audioPart.mimeType || 'audio/wav',
      voiceName,
      style: stylePrompt,
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Error al generar la voz de audio con Gemini TTS.',
    });
  }
});

// Endpoint: AI Copywriting / Enhancements using gemini-3.8-flash
app.post('/api/marketing/enhance', async (req: Request, res: Response) => {
  try {
    const { text, action, gender = 'femenina' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'El texto es requerido.' });
    }

    const voiceDescription = gender === 'masculina'
      ? 'un locutor masculino dinámico, enérgico, persuasivo y cercano'
      : 'una locutora femenina alegre, dinámica, efusiva y convincente';

    let prompt = '';
    switch (action) {
      case 'add-cues':
        prompt = `Actúa como especialista de locución publicitaria en Axomania Behavioral Creative Studio.
Toma el siguiente texto de marketing y añade pausas expresivas (...) y micro-acotaciones de voz compatibles con Gemini TTS como <breath>, <laugh> o <gasp> de forma sutil y natural para que ${voiceDescription} suene 100% humano, magnético y con excelente cadencia.
NO cambies el mensaje central. Devuelve ÚNICAMENTE el texto modificado listo para ser locutado.

Texto original:
"""
${text}
"""`;
        break;

      case 'tiktok-hook':
        prompt = `Reescribe este texto de marketing para convertirlo en un gancho ultra dinámico y viral de 15 segundos para TikTok / Instagram Reels.
El tono debe ser: ${voiceDescription}, ritmo veloz, entusiasta y sumamente atractivo.
Devuelve ÚNICAMENTE el guión listo para locución.

Texto original:
"""
${text}
"""`;
        break;

      case 'loss-aversion':
        prompt = `Actúa como estratega de ciencias del comportamiento en Axomania Behavioral Creative Studio.
Intensifica el principio psicológico de aversión a la pérdida ("loss aversion") en este texto de marketing, enfocando el dolor y la fricción que el cliente evitará resolver.
El tono debe ser: ${voiceDescription}, seguro, revelador y persuasivo.
Devuelve ÚNICAMENTE el texto reescrito listo para locución.

Texto original:
"""
${text}
"""`;
        break;

      case 'axomania-style':
        prompt = `Actúa como Director Creativo de Axomania Behavioral Creative Studio.
Reescribe y potencia este copy publicitario aplicando psicología del consumidor (aversión a la pérdida, dolor vs beneficio, especificidad conductual).
Asegúrate de que el cierre concluya con gran fuerza con el lema oficial de la marca:
"¡No es para todos y es por eso que funciona!"
Tono: ${voiceDescription}.
Devuelve ÚNICAMENTE el texto final listo para locución.

Texto original:
"""
${text}
"""`;
        break;

      default:
        prompt = `Mejora la cadencia y ritmo oral de este texto de marketing para que suene dinámico, magnético y fluido al ser locutado por ${voiceDescription}.
Devuelve ÚNICAMENTE el texto pulido.

Texto original:
"""
${text}
"""`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const resultText = response.text || '';
    return res.json({ resultText: resultText.trim() });
  } catch (error: any) {
    console.error('Marketing enhancement error:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar el texto con Gemini.',
    });
  }
});

// Start Express and integrate Vite in development
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML serving in SPA
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  // Graceful shutdown handlers
  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
