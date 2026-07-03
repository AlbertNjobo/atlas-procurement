import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ItemDetailsCard() {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white dark:bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Service Description</h3>
          <div className="bg-background border rounded-lg p-3 text-sm">
            A two-phase experiential marketing engagement is proposed, beginning with strategic and concept development based on consumer insights and cultural relevance. The project includes campaign architecture, experience journey mapping, and pre-production planning. The second phase covers full-scale live event activation, including immersive installation design and build, venue management, brand ambassador recruitment and training, and on-site experience operations for a two-day event. Real-time social content capture and a post-event recap with a highlight reel and performance report are also included. The engagement is designed to deliver impactful consumer brand moments.
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-3">Item Details</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Deliverables</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">Total Price (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">1</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    Experiential Strategy & Concept Development
                  </TableCell>
                  <TableCell className="text-right">32,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">2</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    Full Event Build & Live Activation
                  </TableCell>
                  <TableCell className="text-right">48,000</TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableCell></TableCell>
                  <TableCell>
                    <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                      <Plus className="h-4 w-4" /> Add Deliverables
                    </button>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 flex justify-between items-center border-t">
              <span className="font-medium text-muted-foreground">Total amount</span>
              <span className="font-bold text-lg">USD 80,000.00</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-md px-6">Continue</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
