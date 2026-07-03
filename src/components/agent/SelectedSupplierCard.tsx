import { Building2, Pencil, CheckCircle2 } from "lucide-react";

export function SelectedSupplierCard() {
  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-sm bg-amber-100 flex items-center justify-center">
          <div className="w-2 h-2 rounded-sm bg-amber-500 rotate-45" />
        </div>
        <span className="font-medium">Selected supplier</span>
      </div>
      
      <div className="bg-white dark:bg-card border rounded-xl p-5 shadow-sm relative">
        <button className="absolute top-4 right-4 p-1.5 border rounded-md text-muted-foreground hover:bg-muted">
          <Pencil className="h-4 w-4" />
        </button>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">Equinox SI Partners</h3>
            <p className="text-sm text-muted-foreground mt-1">1095 Wunderlich Dr, ... San Jose, United States <span className="mx-2">|</span> ID: 1800457295</p>
          </div>
          <Building2 className="h-8 w-8 text-muted-foreground/30 mr-8" />
        </div>
        
        <div className="border-t pt-4 flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Select contact
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Enabled for payments</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Payment terms: - v
          </div>
        </div>
      </div>
    </div>
  );
}
