import { ArrowRight, FileEdit, CheckSquare, Send, Truck, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProcureToPayJourney() {
  const steps = [
    {
      title: 'Idea / Need',
      description: 'Employee uses Procurement Catalog or manually creates a Purchase Requisition.',
      icon: <FileEdit className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Approval',
      description: 'Manager & Finance team review the formal Requisition for budget approval.',
      icon: <CheckSquare className="h-5 w-5 text-indigo-500" />,
      color: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      title: 'Sourcing (RFQ)',
      description: 'If necessary, Procurement publishes an RFQ to vendors for competitive bids.',
      icon: <Send className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Vendor Portal',
      description: 'Vendors view RFQs, ask questions, and submit bids via an external portal.',
      icon: <Truck className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      title: 'Procure & Pay',
      description: 'Buyer awards a bid, PO is generated, goods are delivered, and invoice paid.',
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30'
    }
  ];

  return (
    <Card className="mb-6 border-dashed border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Procure-to-Pay Journey Overview</CardTitle>
        <CardDescription>
          A visual guide to how this platform handles requests from idea to payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-4 relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 hidden md:block -translate-y-1/2"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1 z-10 w-full group relative bg-background">
              <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center border-4 border-background mb-3 shadow-sm`}>
                {step.icon}
              </div>
              <div className="text-center px-2">
                <div className="font-semibold text-sm mb-1">{step.title}</div>
                <div className="text-xs text-muted-foreground leading-snug max-w-[180px] mx-auto hidden md:block group-hover:text-foreground transition-colors">
                  {step.description}
                </div>
              </div>
              
              {/* Mobile description */}
              <div className="text-xs text-muted-foreground text-center mt-1 mb-4 md:hidden">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
