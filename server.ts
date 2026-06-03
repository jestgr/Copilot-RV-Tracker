/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the GoogleGenAI instance for server side AI execution
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // API Endpoint to parse custom unstructured checklists using Gemini AI
  app.post('/api/parse-checklist', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: 'Checklist text input is required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not defined in the environment.');
        return res.status(500).json({ 
          error: 'Gemini API is not configured on the server. Please check your AI Studio secrets settings.' 
        });
      }

      console.log('Sending parsing request to Gemini 3.5 Flash...');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an expert at organizing rv, camping, or travel trailer user instructions. 
Analyze the following unstructured, pasted text checklist and compile it into a structured checklist with grouped steps and detailed substeps. 
Separate actual operational steps from notes, warnings, or external explanations.

Unstructured text to analyze:
"${text}"`,
        config: {
          systemInstruction: 'You are a highly efficient system that converts copy-pasted notes or bullet-points into high-quality, structured operational checklists with logical headings (steps) and checkable actions (substeps). Format output as strict JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { 
                type: Type.STRING, 
                description: 'A clear, descriptive title of this checklist (e.g. "Water Heater Maintenance" or "Pre-Departure Hitching")' 
              },
              steps: {
                type: Type.ARRAY,
                description: 'The main phases or major segments of the checklist',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { 
                      type: Type.STRING, 
                      description: 'The core category or main activity of this phase (e.g. "Prepare plumbing connections" or "Interior visual safety loop")' 
                    },
                    notes: { 
                      type: Type.STRING, 
                      description: 'Context, warnings, specs, or detailed explanations regarding this step.' 
                    },
                    substeps: {
                      type: Type.ARRAY,
                      description: 'The tactical action items/checkpoints that the hiker/camper will physically check off',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { 
                            type: Type.STRING, 
                            description: 'Actionable checkbox instruction (e.g. "Unscrew anode rod" or "Verify safety lock pin is engaged")' 
                          }
                        },
                        required: ['title']
                      }
                    }
                  },
                  required: ['title', 'notes', 'substeps']
                }
              }
            },
            required: ['name', 'steps']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Emply response received from Gemini.');
      }

      const parsedJson = JSON.parse(responseText.trim());
      return res.json(parsedJson);

    } catch (error: any) {
      console.error('Error in /api/parse-checklist:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to parse the checklist text. Please try again with different inputs or formatting.' 
      });
    }
  });

  // Serve static UI assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving built static application assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full stack Express/Vite server:', err);
});
