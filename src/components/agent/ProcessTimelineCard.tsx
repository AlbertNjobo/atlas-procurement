import { Clock, CheckCircle2, Circle } from "lucide-react";
import { ChevronDown } from "lucide-react";

export function ProcessTimelineCard() {
  const steps = [
    { name: "Request Screening & Enrichment", status: "completed" },
    { name: "Exception & Tax Compliance Review", status: "completed", subtitle: "All steps will be executed in parallel" },
    { name: "New Supplier Onboarding", status: "completed" },
    { name: "FP&A Review", status: "current" },
    { name: "PO Approval", status: "pending" },
    { name: "Purchase Order Creation", status: "pending" }
  ];

  return (
    <div className="w-full max-w-xl">
      <div className="bg-white dark:bg-card border rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-lg mb-4">Process details</h3>
        
        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 mb-6 border">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Estimated duration to complete the process</p>
            <p className="text-sm text-muted-foreground">5-7 days</p>
          </div>
        </div>
        
        <div className="relative pl-3 space-y-6 before:absolute before:inset-0 before:ml-[1.4rem] before:w-px md:before:mx-auto md:before:translate-x-0 before:bg-border before:z-0">
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background
                  ${step.status === 'completed' ? 'border-primary text-primary' : 
                    step.status === 'current' ? 'border-primary text-primary ring-4 ring-primary/20' : 
                    'border-muted-foreground/30 text-muted-foreground'}`}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-medium">{idx + 1}</span>}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${step.status === 'pending' ? 'text-muted-foreground' : ''}`}>{step.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                {step.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{step.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center justify-between border-t pt-4">
          <button className="text-sm font-medium text-primary hover:underline">Hide steps</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted">Back</button>
            <button className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
