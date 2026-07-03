import { AlertCircle, CalendarClock, PackageOpen, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ImpactAnalysisCard() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      {/* 1. Flagger Overdue POs */}
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="bg-red-50/50 dark:bg-red-950/20 pb-3">
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4" /> Overdue Purchase Orders
          </CardTitle>
          <CardDescription className="text-xs">
            2 POs are currently past their expected delivery dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-sm">
          <div className="grid gap-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">PO-2024-0891 - Tech Corp Laptops</div>
                <div className="text-xs text-muted-foreground">Supplier: GlobalEdge</div>
              </div>
              <Badge variant="destructive" className="text-[10px]">5 Days Overdue</Badge>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">PO-2024-0902 - Office Chairs</div>
                <div className="text-xs text-muted-foreground">Supplier: Furniture Solutions</div>
              </div>
              <Badge variant="destructive" className="text-[10px]">2 Days Overdue</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Parsed Vendor Message */}
      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 pb-3">
          <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" /> Recent Vendor Communication Parsed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 text-sm">
          <div className="bg-muted/50 p-3 rounded-md mb-3 border text-xs text-muted-foreground italic">
            "Hello, due to customs issues, the shipment for PO-2024-0891 (Laptops) will be delayed by another 7 days. Also, shipping costs have increased by $150." - GlobalEdge Rep
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
             <div className="bg-white dark:bg-black/20 p-2 rounded border">
                <div className="text-muted-foreground font-medium mb-1">Detected Delay</div>
                <div className="flex items-center gap-2 text-amber-600 font-medium">
                  Current: Nov 10 <ArrowRight className="h-3 w-3" /> New: Nov 17
                </div>
             </div>
             <div className="bg-white dark:bg-black/20 p-2 rounded border">
                <div className="text-muted-foreground font-medium mb-1">Detected Price Impact</div>
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  +$150.00 (Shipping Variance)
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Inventory Impact Warning */}
      <Card className="border-amber-200 shadow-sm bg-amber-50/10 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4" /> Inventory & Operational Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
              <PackageOpen className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">Critical Stock Out Risk: Standard Laptops (SKU: LT-001)</p>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-xs mt-1">
                The 7-day delay from GlobalEdge pushes delivery to Nov 17. Current internal inventory is 3 units. Based on average onboarding rate (5/week), stock will deplete by Nov 12.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
