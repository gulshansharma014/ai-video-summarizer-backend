import { config } from 'dotenv';
config();
import express, { json } from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit'; 
import cors from 'cors';


// const router = express.Router();

const app = express();
const PORT = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Gemini API key

app.use(cors({ origin: process.env.FRONTEND_LIVE_URL})); // frontend URL

app.use(json());

app.get('/api/transcript', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Please provide a valid YouTube URL.'
    });
  }

  try {
    const videoId = extractVideoId(url);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript
      .map((entry) => entry.text)
      .join(' ');

    return res.json({
      transcript: transcriptText
    });
  } catch (error) {
    const isInvalidUrl = error.message === 'Invalid YouTube URL.';

    return res.status(isInvalidUrl ? 400 : 500).json({
      error: isInvalidUrl
        ? error.message
        : `Failed to fetch transcript: ${error.message}`
    });
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

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      error: 'Content is required to generate the PDF.'
    });
  }

  try {
    const filename = `analyzed-transcript-${Date.now()}.pdf`;
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text('Analysed Transcript', {
        align: 'center'
      })
      .moveDown();

    doc
      .fontSize(11)
      .text(content.trim(), {
        align: 'left',
        lineGap: 4
      });

    doc.end();
  } catch (error) {
    console.error('PDF generation failed:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to generate PDF.'
      });
    }

    res.end();
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
