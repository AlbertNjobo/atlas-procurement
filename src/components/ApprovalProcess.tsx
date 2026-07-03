import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApprovalStep {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed' | 'rejected';
  actor?: string;
  date?: string;
}

interface ApprovalProcessProps {
  steps: ApprovalStep[];
  className?: string;
}

export function ApprovalProcess({ steps, className }: ApprovalProcessProps) {
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isRejected = step.status === 'rejected';
          
          // Determine if the line to the next step should be colored
          const lineCompleted = isCompleted && step.status !== 'rejected';

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative group">
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-4 left-[50%] right-[-50%] h-[2px] transition-colors",
                    lineCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
              
              {/* Step indicator */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background z-10 transition-colors",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                  isRejected ? "border-destructive bg-destructive text-destructive-foreground" :
                  isCurrent ? "border-primary text-primary" : 
                  "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : 
                 isRejected ? <AlertCircle className="w-4 h-4" /> :
                 isCurrent ? <Clock className="w-4 h-4" /> :
                 <span className="text-xs font-medium">{index + 1}</span>}
              </div>
              
              {/* Step details */}
              <div className="flex flex-col items-center mt-2 text-center min-h-[3.5rem] px-1">
                <span 
                  className={cn(
                    "text-[11px] sm:text-xs font-medium transition-colors leading-tight",
                    isCurrent || isCompleted || isRejected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.actor && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[80px] truncate" title={step.actor}>
                    {step.actor}
                  </span>
                )}
                {step.date && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {step.date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
