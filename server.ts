import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini client (telemetry User-Agent included)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Full-stack API endpoint for AI Customizer (safely proxies request to Gemini)
  app.post('/api/customize', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt is required.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an elite product designer for premium sports gear. 
        Design a custom 3D printed airless basketball inspired by the user's "vibe" prompt.
        
        User Prompt: "${prompt}"
        
        Generate a unique color scheme, material specs, and description.
        You must return a strictly formatted JSON object with:
        1. primaryColor (valid HTML hex code, e.g., "#E53E3E")
        2. lineColor (valid HTML hex code, contrast color for channels, e.g., "#1A202C")
        3. accentColor (vibrant matching theme/glow color, e.g., "#DD6B20")
        4. roughness (number 0.0 to 1.0, e.g. 0.3)
        5. metalness (number 0.0 to 1.0, e.g. 0.8)
        6. internalGlowColor (gorgeous color for the physical light scattering inside, e.g., "#FFBB00")
        7. name (short, impactful, futuristic name, e.g., "PULSAR")
        8. description (short luxury tagline for the ball, e.g., "A celestial fusion of gravity and solar forge.")
        9. badge (2-word capsule text, e.g., "AI Special")`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT' as any,
            properties: {
              primaryColor: { type: 'STRING' as any },
              lineColor: { type: 'STRING' as any },
              accentColor: { type: 'STRING' as any },
              roughness: { type: 'NUMBER' as any },
              metalness: { type: 'NUMBER' as any },
              internalGlowColor: { type: 'STRING' as any },
              name: { type: 'STRING' as any },
              description: { type: 'STRING' as any },
              badge: { type: 'STRING' as any }
            },
            required: [
              'primaryColor', 
              'lineColor', 
              'accentColor', 
              'roughness', 
              'metalness', 
              'internalGlowColor', 
              'name', 
              'description', 
              'badge'
            ]
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsedData = JSON.parse(jsonText);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Server Gemini Error:', error);
      // Fail gracefully: Return a beautiful, high-tech neon fallback
      res.json({
        primaryColor: '#FF3366',
        lineColor: '#121214',
        accentColor: '#FF1166',
        roughness: 0.35,
        metalness: 0.8,
        internalGlowColor: '#FF66AA',
        name: 'HYPER_NOVA',
        description: 'A stellar eruption forged dynamically in the AI Studio laboratory.',
        badge: 'AI Fallback'
      });
    }
  });

  // Integration with Vite dev server or static file hosting
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R3F Airless Basketball Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
