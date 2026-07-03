const fs = require('fs');
let content = fs.readFileSync('src/pages/AgentChat.tsx', 'utf-8');

const inputAnchor = `<div className="relative flex-1 flex items-center">
                <Input 
                  placeholder="Describe your business needs..." `;

const inputReplacement = `<div className="relative flex-1 flex items-center">
                {isRecording && (
                  <div className="absolute inset-y-0 left-0 right-20 bg-background/80 backdrop-blur-sm rounded-l-full flex items-center pl-4 z-10 border-y border-l border-muted-foreground/20">
                    <span className="text-purple-600 font-medium text-sm mr-3">Listening...</span>
                    <div className="flex items-center gap-1 h-5">
                      <div className="w-1 h-full bg-purple-500 rounded-full animate-waveform [animation-delay:-0.4s]" />
                      <div className="w-1 h-full bg-purple-500 rounded-full animate-waveform [animation-delay:-0.2s]" />
                      <div className="w-1 h-full bg-purple-500 rounded-full animate-waveform [animation-delay:-0.6s]" />
                      <div className="w-1 h-full bg-purple-500 rounded-full animate-waveform [animation-delay:-0.1s]" />
                      <div className="w-1 h-full bg-purple-500 rounded-full animate-waveform [animation-delay:-0.5s]" />
                    </div>
                  </div>
                )}
                <Input 
                  placeholder="Describe your business needs..." `;

content = content.replace(inputAnchor, inputReplacement);

const buttonAnchor = `<div className="absolute right-1.5 flex items-center gap-1">`;
const buttonReplacement = `<div className="absolute right-1.5 flex items-center gap-1 z-20">`;

content = content.replace(buttonAnchor, buttonReplacement);

fs.writeFileSync('src/pages/AgentChat.tsx', content);
