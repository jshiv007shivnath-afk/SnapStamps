import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getMapsApiKey(): string | null {
  const key = (process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '').trim();
  if (!key || key === 'MY_GOOGLE_MAPS_API_KEY') {
    return null;
  }
  return key;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'snapstamps' });
  });

  // Google Maps Places API (New) proxy — prevents CORS issues (CF1)
  app.post('/api/places/nearby', async (req: Request, res: Response) => {
    const mapsKey = getMapsApiKey();
    if (!mapsKey) {
      res.status(503).json({
        error: 'Google Maps API key is not configured.',
        code: 'MAPS_KEY_MISSING',
      });
      return;
    }

    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    const radius = Math.min(Math.max(Number(req.body?.radius || 4500), 100), 50000);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'Valid latitude and longitude are required.' });
      return;
    }

    try {
      const upstream = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.primaryTypeDisplayName,places.types',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify({
          includedTypes: ['tourist_attraction', 'museum', 'historical_landmark', 'park'],
          maxResultCount: 10,
          rankPreference: 'POPULARITY',
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius,
            },
          },
        }),
      });

      const payload = (await upstream.json()) as {
        places?: Array<Record<string, unknown>>;
        error?: { status?: string; message?: string };
      };

      if (!upstream.ok) {
        const isQuota =
          upstream.status === 429 || payload?.error?.status === 'RESOURCE_EXHAUSTED';
        res.status(upstream.status).json({
          error: payload?.error?.message || 'Unable to fetch nearby landmarks.',
          status: payload?.error?.status,
          quotaExceeded: isQuota,
        });
        return;
      }

      res.json({ places: payload.places ?? [] });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Places lookup failed.',
      });
    }
  });

  app.post('/api/places/search', async (req: Request, res: Response) => {
    const mapsKey = getMapsApiKey();
    if (!mapsKey) {
      res.status(503).json({
        error: 'Google Maps API key is not configured.',
        code: 'MAPS_KEY_MISSING',
      });
      return;
    }

    const textQuery = String(req.body?.query || '').trim();
    if (!textQuery) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    try {
      const upstream = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.primaryTypeDisplayName,places.types',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify({
          textQuery,
          pageSize: 8,
        }),
      });

      const payload = (await upstream.json()) as {
        places?: Array<Record<string, unknown>>;
        error?: { status?: string; message?: string };
      };

      if (!upstream.ok) {
        const isQuota =
          upstream.status === 429 || payload?.error?.status === 'RESOURCE_EXHAUSTED';
        res.status(upstream.status).json({
          error: payload?.error?.message || 'Unable to search landmarks.',
          status: payload?.error?.status,
          quotaExceeded: isQuota,
        });
        return;
      }

      res.json({ places: payload.places ?? [] });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Places search failed.',
      });
    }
  });

  // Gemini Nano Banana 2.1 Stamp Generation Route
  app.post('/api/stamps/generate', async (req: Request, res: Response) => {
    const promptText = String(req.body?.prompt || '').trim();
    const destination = String(req.body?.destination || '').trim();
    const stylePreset = String(req.body?.style || 'Vintage Risograph').trim();

    if (!promptText) {
      res.status(400).json({ error: 'Please enter a prompt describing your stamp artwork.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(403).json({
        error:
          'A billing-enabled Gemini API key in Settings > Secrets is required to run gemini-nano-banana-2.1.',
        code: 'API_KEY_REQUIRED',
      });
      return;
    }

    const fullPrompt = [
      `Vintage travel poster illustration for a collector postage stamp of ${destination || 'the destination'}.`,
      `Scene: ${promptText}.`,
      `Art direction: ${stylePreset}, clean gouache and risograph print texture, warm sun circle, vibrant balanced palette, no embedded text, no stamp borders or frames.`,
    ].join(' ');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
            imageSize: '1K',
          },
        },
      });

      let imageUrl: string | null = null;
      let notes = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          notes += part.text;
        }
      }

      if (!imageUrl) {
        res.status(502).json({
          error: 'No image was returned by gemini-nano-banana-2.1. Please refine your prompt.',
        });
        return;
      }

      res.json({ imageUrl, notes: notes.trim() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image generation failed.';
      const statusCode = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
        ? 429
        : msg.includes('403') || msg.includes('PERMISSION_DENIED')
          ? 403
          : 500;
      res.status(statusCode).json({ error: msg });
    }
  });

  // Gemini Nano Banana 2.1 Stamp Editing Route
  app.post('/api/stamps/edit', async (req: Request, res: Response) => {
    const promptText = String(req.body?.prompt || '').trim();
    const imageBase64 = String(req.body?.imageBase64 || '').trim();
    const mimeType = String(req.body?.mimeType || 'image/jpeg').trim();

    if (!promptText || !imageBase64) {
      res.status(400).json({ error: 'Both a source image and an edit instruction are required.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(403).json({
        error:
          'A billing-enabled Gemini API key in Settings > Secrets is required to edit stamp artwork with gemini-nano-banana-2.1.',
        code: 'API_KEY_REQUIRED',
      });
      return;
    }

    const cleanedBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanedBase64,
                mimeType,
              },
            },
            {
              text: `Edit this vintage travel stamp illustration: ${promptText}. Keep the clean gouache/risograph travel poster style without adding borders or text.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
            imageSize: '1K',
          },
        },
      });

      let imageUrl: string | null = null;
      let notes = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          notes += part.text;
        }
      }

      if (!imageUrl) {
        res.status(502).json({
          error: 'No edited image was returned by gemini-nano-banana-2.1.',
        });
        return;
      }

      res.json({ imageUrl, notes: notes.trim() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image editing failed.';
      const statusCode = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
        ? 429
        : msg.includes('403') || msg.includes('PERMISSION_DENIED')
          ? 403
          : 500;
      res.status(statusCode).json({ error: msg });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SnapStamps server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
