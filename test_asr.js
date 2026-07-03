import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

async function main() {
  const audioData = fs.readFileSync("asr_example.wav", "base64");
  const completion = await openai.chat.completions.create({
    model: "qwen3.5-omni-flash",
    messages: [
      { role: "system", content: "Transcribe the following audio exactly as spoken. Output only the transcription text. Ignore non-speech sounds." },
      { role: "user", content: [
        { type: "input_audio", input_audio: { data: audioData, format: "wav" } }
      ] }
    ]
  });
  console.log(completion.choices[0].message.content);
}
main().catch(console.error);
