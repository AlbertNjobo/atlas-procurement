const fs = require('fs');
let content = fs.readFileSync('src/pages/AgentChat.tsx', 'utf-8');

// 1. Add Mic to lucide-react imports
content = content.replace(
  "import { Bot, User, Send, FileText, CheckCircle, Paperclip, Table as TableIcon, Activity, UserPlus, Upload, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';",
  "import { Bot, User, Send, FileText, CheckCircle, Paperclip, Table as TableIcon, Activity, UserPlus, Upload, ChevronDown, ChevronUp, AlertCircle, Loader2, Mic, Square } from 'lucide-react';"
);

// 2. Add state variables
const stateVarsInsert = `  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

`;
content = content.replace("  const scrollRef = useRef<HTMLDivElement>(null);", stateVarsInsert + "  const scrollRef = useRef<HTMLDivElement>(null);");

// 3. Add recording functions
const functionsInsert = `
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported('audio/webm') ? options : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const format = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'mp3';
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          try {
            toast.info("Transcribing audio...", { id: 'transcribe' });
            const response = await fetch('/api/agent/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64data, format })
            });
            if (response.ok) {
              const data = await response.json();
              if (data.text) {
                setInput(prev => prev + (prev ? " " : "") + data.text);
                toast.success("Transcription added", { id: 'transcribe' });
              } else {
                toast.error("No speech detected", { id: 'transcribe' });
              }
            } else {
              toast.error("Failed to transcribe", { id: 'transcribe' });
            }
          } catch (e) {
            toast.error("Error transcribing audio", { id: 'transcribe' });
          }
          
          stream.getTracks().forEach(track => track.stop());
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async (overrideInput?: string) => {`;
content = content.replace("  const handleSend = async (overrideInput?: string) => {", functionsInsert);

// 4. Add microphone button to UI
// Original input:
//                 <Input 
//                   placeholder="Describe your business needs..." 
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   className="flex-1 rounded-full pl-4 pr-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-purple-500 h-12"
//                   disabled={isLoading}
//                 />
//                 <Button 
//                   type="submit" 
//                   disabled={isLoading || !input.trim()}
//                   size="icon"
//                   className="absolute right-1.5 h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>

const inputAnchor = `className="flex-1 rounded-full pl-4 pr-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-purple-500 h-12"
                  disabled={isLoading}
                />`;
const replacementInput = `className="flex-1 rounded-full pl-4 pr-24 bg-muted/30 border-muted-foreground/20 focus-visible:ring-purple-500 h-12"
                  disabled={isLoading}
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <Button 
                    type="button" 
                    onClick={toggleRecording}
                    variant="ghost"
                    size="icon"
                    className={\`h-9 w-9 rounded-full \${isRecording ? 'text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 animate-pulse' : 'text-muted-foreground hover:text-foreground'}\`}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>`;
content = content.replace(inputAnchor, replacementInput);

// Need to remove the original send button
const originalSendButton = `                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="absolute right-1.5 h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>`;
content = content.replace(originalSendButton, "");

fs.writeFileSync('src/pages/AgentChat.tsx', content);
