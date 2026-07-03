import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  date?: string;
  active?: boolean;
  done?: boolean;
}

interface PipelineStepperProps {
  steps: Step[];
  className?: string;
}

export function PipelineStepper({ steps, className }: PipelineStepperProps) {
  return (
    <div className={cn("relative flex justify-between items-start", className)}>
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-muted -z-10"></div>
      <div 
        className="absolute top-5 left-6 h-0.5 bg-primary -z-10 transition-all duration-500 ease-in-out" 
        style={{ width: `${Math.max(0, (steps.filter(s => s.done).length - 1) / (steps.length - 1)) * 100}%` }}
      ></div>
      
      {steps.map((step, idx) => (
        <div key={step.id} className="flex flex-col items-center relative bg-card pt-1 px-2 z-10 w-24 sm:w-32">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 transition-colors duration-300",
            step.done 
              ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
              : step.active 
                ? 'bg-background border-primary text-primary shadow-sm ring-4 ring-primary/10' 
                : 'bg-background border-muted text-muted-foreground'
          )}>
            {step.done ? <Check className="h-5 w-5" /> : step.icon || <div className="w-2 h-2 rounded-full bg-current" />}
          </div>
          <div className="text-center w-full">
            <div className={cn(
              "text-xs font-medium leading-tight mb-1",
              step.active || step.done ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {step.title}
            </div>
            {step.date && (
              <div className="text-[10px] text-muted-foreground font-medium">
                {step.date}
              </div>
            )}
            {step.description && (
              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight hidden sm:block">
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
