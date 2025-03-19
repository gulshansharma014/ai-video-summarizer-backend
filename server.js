import { config } from 'dotenv';
config();
import express, { json } from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit'; 
import { createWriteStream, unlinkSync } from 'fs';  // For writing the PDF file


// const router = express.Router();

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY}); //openai API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Google API key

app.use(json());

app.get('/api/transcript', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Please provide a valid YouTube URL." });

    const videoId = extractVideoId(url);

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const transcriptText = transcript.map(entry => entry.text).join(' ');
        res.json({ transcript: transcriptText });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch transcript. " + error.message });
    }
});

function extractVideoId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (!match) throw new Error('Invalid YouTube URL.');
    return match[1];
}

app.post('/api/analyze-transcript', async (req, res) => {
    console.log("Request came");
    
    const { transcript } = req.body;
    console.log(`transcript got: ${transcript}`);
    

    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Please analyze the following transcript and reformat it into a clear, structured layout with:
        - Key points highlighted
        - Easy-to-understand language
        - Visual examples or scenarios where applicable
        - Bonus tips to support learning

        Transcript: 
        ${transcript}
        `;

        const result = await model.generateContent(prompt);
        const generatedText = result.response.text();

        res.json({ analyzedTranscript: generatedText });

    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({ error: 'Failed to analyze transcript.' });
    }
});

app.post('/api/download-analyzed-pdf', (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'No content provided.' });
    }

    const doc = new PDFDocument();
    const filename = `analyzed_transcript_${Date.now()}.pdf`;
    const filePath = `./downloads/${filename}`;

    const writeStream = createWriteStream(filePath);
    doc.pipe(writeStream);

    doc
        .fontSize(18)
        .text('Analyzed Transcript', { align: 'center' })
        .moveDown(1)
        .fontSize(12)
        .text(content, { align: 'left' });

    doc.end();

    writeStream.on('finish', () => {
        console.log(`✅ PDF created at: ${filePath}`);

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                res.status(500).json({ error: 'Failed to download PDF.' });
            }
            unlinkSync(filePath); // Clean up
        });
    });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
