// Import library yang diperlukan
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

// buat variable app untuk express
const app = express();

// buat variable upload untuk multer
const upload = multer();

// buat variable untuk akses GoogleGenAi
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// buat variable gemini model yang akan digunakan
const GEMINI_MODEL = "gemini-2.0-flash";

app.use(express.json());

// Kita akan jalankan di local PORT 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

// endpoint POST untuk generate text /generate-text
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})


// endpoint POST untuk generate from image /generate-from-image
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: 'text' },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})
// endpoint POST untuk generate from image /generate-from-document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buatkan ringkasan dari dokumen berikut: ", type: 'text' },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})
// endpoint POST untuk generate from image /generate-from-audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buatkan transkrip dari rekaman berikut: ", type: 'text' },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})