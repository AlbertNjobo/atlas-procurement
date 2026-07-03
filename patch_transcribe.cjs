const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const anchor = `app.post("/api/agent/chat", async (req, res) => {`;
const insert = `app.post("/api/agent/transcribe", async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: "OpenAI client not initialized" });
  }

  try {
    const { audioData, format } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "qwen3.5-omni-flash",
      messages: [
        { role: "system", content: "Transcribe the following audio exactly as spoken. Output only the transcription text. Ignore non-speech sounds. Respond ONLY with the transcript text, no markdown, no other text." },
        { role: "user", content: [
          { type: "input_audio", input_audio: { data: audioData, format: format || "wav" } }
        ] }
      ]
    });
    
    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message || "Failed to transcribe audio" });
  }
});

`;

content = content.replace(anchor, insert + anchor);
fs.writeFileSync('server.ts', content);
