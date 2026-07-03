const fs = require('fs');
let content = fs.readFileSync('src/pages/RequestTracker.tsx', 'utf-8');

if (!content.includes('import { PipelineStepper }')) {
  content = content.replace(
    "import { useMatchValidator } from '../hooks/useMatchValidator';",
    "import { useMatchValidator } from '../hooks/useMatchValidator';\nimport { PipelineStepper } from '../components/PipelineStepper';"
  );
  
  const originalStepper = `<div className="relative flex justify-between items-start">
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-muted -z-10"></div>
            <div className="absolute top-5 left-6 h-0.5 bg-primary -z-10 transition-all" style={{ width: \`\${Math.max(0, (steps.filter(s => s.done).length - 1) / (steps.length - 1)) * 100}%\` }}></div>
            
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center relative bg-card pt-1 px-2">
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 \${step.done ? 'bg-primary border-primary text-primary-foreground' : step.active ? 'bg-background border-primary text-primary' : 'bg-background border-muted text-muted-foreground'}\`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <div className={\`text-sm font-medium \${step.active ? 'text-foreground' : 'text-muted-foreground'}\`}>{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.date}</div>
                </div>
              </div>
            ))}
          </div>`;
          
  const newStepper = `<PipelineStepper steps={steps} className="w-full max-w-4xl mx-auto" />`;
  
  content = content.replace(originalStepper, newStepper);
  
  fs.writeFileSync('src/pages/RequestTracker.tsx', content);
}
