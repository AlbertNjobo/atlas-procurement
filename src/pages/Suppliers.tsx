import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MoreHorizontal, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { AgentDialog } from '../components/agent/AgentDialog';
import { useData, Supplier } from '../lib/data-context';

const initialSuppliers = [
  { id: 'SUP-001', name: 'Amazon Web Services', category: 'IT Software', risk: 'Low', status: 'Active', compliance: true },
  { id: 'SUP-002', name: 'Stripe Inc.', category: 'Financial Services', risk: 'Low', status: 'Active', compliance: true },
  { id: 'SUP-003', name: 'Acme Corp', category: 'Hardware', risk: 'Medium', status: 'Onboarding', compliance: false },
  { id: 'SUP-004', name: 'Global Logistics LLC', category: 'Logistics', risk: 'High', status: 'Under Review', compliance: false },
];

const performanceData = [
  { month: 'Jan', onTimeDelivery: 92, costVariance: 2 },
  { month: 'Feb', onTimeDelivery: 94, costVariance: -1 },
  { month: 'Mar', onTimeDelivery: 89, costVariance: 3 },
  { month: 'Apr', onTimeDelivery: 95, costVariance: 0 },
  { month: 'May', onTimeDelivery: 98, costVariance: -2 },
  { month: 'Jun', onTimeDelivery: 96, costVariance: 1 },
];

export function Suppliers() {
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get('id');

  const { suppliers, setSuppliers, updateSupplier } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Supplier>>({});

  useEffect(() => {
    if (viewId) {
      const found = suppliers.find(s => s.id === viewId);
      if (found) {
        setSelectedSupplier(found);
        setEditData(found);
      }
    }
  }, [viewId, suppliers]);
  
  const [newSupplier, setNewSupplier] = useState({
    name: '', category: '', email: '', risk: 'Medium'
  });

  const handleCreateSupplier = () => {
    if (!newSupplier.name || !newSupplier.category) {
      toast.error('Name and category are required.');
      return;
    }
    const newId = `SUP-00${suppliers.length + 1}`;
    updateSupplier(newId, {
      name: newSupplier.name,
      category: newSupplier.category,
      email: newSupplier.email,
      contact_email: newSupplier.email,
      risk: newSupplier.risk,
      status: 'Onboarding',
      compliance: false
    });
    setIsAddOpen(false);
    setNewSupplier({ name: '', category: '', email: '', risk: 'Medium' });
    toast.success('Supplier added successfully.');
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground mt-2">Manage your vendor ecosystem, compliance, and risks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100" onClick={() => setIsAgentDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Suggest Vendor
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{suppliers.filter(s => s.status === 'Active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{suppliers.filter(s => s.risk === 'High').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{suppliers.filter(s => !s.compliance).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance Metrics (Last 6 Months)</CardTitle>
          <CardDescription>Aggregate performance across all active suppliers.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="onTimeDelivery" name="On-Time Delivery (%)" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="costVariance" name="Avg Cost Variance (%)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>Comprehensive list of all registered and prospective vendors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((sup) => (
                <TableRow key={sup.id}>
                  <TableCell className="font-medium">{sup.name}</TableCell>
                  <TableCell>{sup.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sup.risk === 'Low' ? 'outline' : 
                      sup.risk === 'Medium' ? 'secondary' : 'destructive'
                    }>
                      {sup.risk} Risk
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sup.compliance ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <ShieldCheck className="h-4 w-4" /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <ShieldAlert className="h-4 w-4" /> Action Required
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sup.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedSupplier(sup)}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Risk Assessment initiated for ${sup.name}`)}>Run Risk Assessment</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(`Document request sent to ${sup.name}`)}>Request Documents</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            updateSupplier(sup.id, { status: sup.status === 'Active' ? 'Inactive' : 'Active' });
                            toast.success(`${sup.name} status updated successfully.`);
                          }}>Update Status</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Enter supplier details manually, or chat with our AI to build the profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" className="w-full bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary" onClick={() => setIsAgentDialogOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" /> AI Supplier Onboarding
            </Button>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input
                id="category"
                value={newSupplier.category}
                onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Hardware"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="col-span-3"
                placeholder="contact@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedSupplier} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedSupplier && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {isEditing ? (
                    <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="text-2xl font-bold h-10 w-2/3" />
                  ) : (
                    <SheetTitle className="text-2xl font-bold">{selectedSupplier.name}</SheetTitle>
                  )}
                  <Badge variant="secondary">{selectedSupplier.status}</Badge>
                </div>
                <SheetDescription className="text-base text-foreground font-medium">
                  ID: {selectedSupplier.id}
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    {isEditing ? (
                      <Input value={editData.category || ''} onChange={e => setEditData({...editData, category: e.target.value})} className="h-8" />
                    ) : (
                      <p className="font-medium">{selectedSupplier.category}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                    <Badge variant={
                      selectedSupplier.risk === 'Low' ? 'outline' : 
                      selectedSupplier.risk === 'Medium' ? 'secondary' : 'destructive'
                    }>
                      {selectedSupplier.risk} Risk
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Compliance Status</p>
                    {selectedSupplier.compliance ? (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <ShieldCheck className="h-4 w-4" /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 font-medium">
                        <ShieldAlert className="h-4 w-4" /> Action Required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <SheetFooter className="mt-8 pt-4 border-t flex sm:justify-between items-center">
                <Button variant="outline" onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setSelectedSupplier(null);
                  }
                }}>
                  {isEditing ? 'Cancel' : 'Close'}
                </Button>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button onClick={() => {
                      updateSupplier(selectedSupplier.id, editData);
                      setSelectedSupplier({ ...selectedSupplier, ...editData });
                      setIsEditing(false);
                      toast.success('Supplier updated.');
                    }}>Save Changes</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => {
                        setEditData(selectedSupplier);
                        setIsEditing(true);
                      }}>Edit Info</Button>
                  <Button variant="outline" onClick={() => {
                    updateSupplier(selectedSupplier.id, { compliance: true });
                    setSelectedSupplier({ ...selectedSupplier, compliance: true });
                    toast.success('Compliance validated.');
                  }}>Approve Compliance</Button>
                  <Button onClick={() => {
                    updateSupplier(selectedSupplier.id, { status: selectedSupplier.status === 'Active' ? 'Inactive' : 'Active' });
                    setSelectedSupplier({ ...selectedSupplier, status: selectedSupplier.status === 'Active' ? 'Inactive' : 'Active' });
                    toast.success('Status toggled.');
                  }}>Toggle Status</Button>
                    </>
                  )}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AgentDialog 
        open={isAgentDialogOpen}
        onOpenChange={setIsAgentDialogOpen}
        contextType="supplier"
        onSuccess={(data) => {
          const newId = `SUP-00${suppliers.length + 1}`;
          updateSupplier(newId, {
            name: data.name,
            category: data.category,
            risk: data.risk_level || 'Medium',
            status: 'Onboarding',
            compliance: false
          });
          setIsAgentDialogOpen(false);
          setIsAddOpen(false);
          toast.success('AI successfully created the supplier profile!');
        }}
      />
    </div>
  );
}
