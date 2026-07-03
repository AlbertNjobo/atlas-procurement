import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function BidMatrixCard() {
  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm w-full max-w-3xl">
      <div className="bg-purple-700 p-3 text-white">
        <h3 className="font-medium text-sm">Initial Bid Matrix for SE-2025-0001 — Welcome Kits Sourcing</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 border-r">#</TableHead>
            <TableHead className="border-r">Parameter</TableHead>
            <TableHead className="border-r">Quantura Supply</TableHead>
            <TableHead className="border-r">GlobalEdge</TableHead>
            <TableHead className="border-r">RedOak Sourcing</TableHead>
            <TableHead>Best</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="border-r text-muted-foreground">1</TableCell>
            <TableCell className="border-r font-medium text-sm">Unit Price — Welcome Kit</TableCell>
            <TableCell className="border-r text-sm">USD 25.00</TableCell>
            <TableCell className="border-r text-sm">USD 27.50</TableCell>
            <TableCell className="border-r text-sm">USD 28.45</TableCell>
            <TableCell className="text-sm font-medium text-purple-700">Quantura Supply</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border-r text-muted-foreground">2</TableCell>
            <TableCell className="border-r font-medium text-sm">Line Total — Welcome Kit (100 EA)</TableCell>
            <TableCell className="border-r text-sm">USD 2,500.00</TableCell>
            <TableCell className="border-r text-sm">USD 2,750.00</TableCell>
            <TableCell className="border-r text-sm">USD 2,845.00</TableCell>
            <TableCell className="text-sm font-medium text-purple-700">Quantura Supply</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border-r text-muted-foreground">3</TableCell>
            <TableCell className="border-r font-medium text-sm">Lead time (days)</TableCell>
            <TableCell className="border-r text-sm">7</TableCell>
            <TableCell className="border-r text-sm font-bold bg-green-50 dark:bg-green-950">6</TableCell>
            <TableCell className="border-r text-sm">9</TableCell>
            <TableCell className="text-sm font-medium text-purple-700">GlobalEdge</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border-r text-muted-foreground">4</TableCell>
            <TableCell className="border-r font-medium text-sm">Quality certificates</TableCell>
            <TableCell className="border-r text-sm"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Yes</Badge></TableCell>
            <TableCell className="border-r text-sm"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Yes</Badge></TableCell>
            <TableCell className="border-r text-sm"><Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">No</Badge></TableCell>
            <TableCell className="text-sm font-medium text-muted-foreground">Tie</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
