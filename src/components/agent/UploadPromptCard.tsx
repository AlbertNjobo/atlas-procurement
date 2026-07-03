import { FileUp, FileText } from "lucide-react";

export function UploadPromptCard() {
  return (
    <div className="w-full max-w-xl">
      <div className="bg-white dark:bg-card border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center border-dashed">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <p className="font-medium text-lg mb-1">Quote for Caterers.pdf</p>
        <p className="text-green-600 font-medium text-sm">File uploaded successfully!</p>
      </div>
    </div>
  );
}
