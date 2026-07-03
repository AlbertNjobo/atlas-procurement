import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MoreHorizontal, Search, Check, Bot, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { AgentDialog } from '../components/agent/AgentDialog';
import { useData, IntakeRequest } from '../lib/data-context';

const initialIntakes = [
  { id: 'REQ-001', title: 'Q3 AWS Hosting', department: 'Engineering', status: 'PO Generated', amount: '$12,400', date: '2026-06-28', supplier: 'Amazon Web Services', description: 'Hosting costs for the Q3 production environment.' },
  { id: 'REQ-002', title: 'Salesforce Licenses', department: 'Sales', status: 'Pending Finance Approval', amount: '$45,000', date: '2026-06-29', supplier: 'Salesforce', description: 'Additional 30 seats for the new SDR team.' },
  { id: 'REQ-003', title: 'Office Supplies', department: 'Operations', status: 'Draft', amount: '$1,200', date: '2026-06-30', supplier: 'Staples', description: 'Monthly restock of paper, pens, and whiteboards.' },
  { id: 'REQ-004', title: 'Marketing Agency', department: 'Marketing', status: 'Pending Manager Approval', amount: '$25,000', date: '2026-06-25', supplier: 'Creative Group', description: 'Retainer for Q3 digital marketing campaigns.' },
  { id: 'REQ-005', title: 'New Laptops', department: 'Engineering', status: 'Pending RFQ', amount: '$15,000', date: '2026-06-29', supplier: '', description: '10 new laptops for the new engineering hires.' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PO Generated':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">{status}</Badge>;
    case 'Pending Manager Approval':
    case 'Pending Finance Approval':
    case 'Pending Executive Approval':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">{status}</Badge>;
    case 'Pending RFQ':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">{status}</Badge>;
    case 'Rejected':
      return <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">{status}</Badge>;
    case 'Draft':
    default:
      return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">{status}</Badge>;
  }
};

import { ApprovalProcess, ApprovalStep } from '../components/ApprovalProcess';

const WORKFLOW_STEPS = ['Draft', 'Pending Manager', 'Pending RFQ', 'Pending Finance', 'Pending Executive', 'PO Generated'];

function getApprovalSteps(currentStatus: string): ApprovalStep[] {
  let displayStatus = currentStatus;
  if (currentStatus === 'Pending Manager Approval') displayStatus = 'Pending Manager';
  if (currentStatus === 'Pending Finance Approval') displayStatus = 'Pending Finance';
  if (currentStatus === 'Pending Executive Approval') displayStatus = 'Pending Executive';
  
  const isRejected = currentStatus === 'Rejected';
  // If rejected, we don't necessarily know which step without history,
  // but let's assume it failed at the last known step or just mark everything pending?
  // Let's just find the index if it was not rejected, else we might not have a perfect match.
  // Actually, we can just say if it's not in the array, it's 0.
  let currentIndex = WORKFLOW_STEPS.indexOf(displayStatus);
  if (currentIndex === -1) currentIndex = isRejected ? 1 : 0; // Default to failing at manager if rejected for simplicity, or we just leave it.

  return WORKFLOW_STEPS.map((step, index) => {
    let status: ApprovalStep['status'] = 'pending';
    let actor: string | undefined;
    let date: string | undefined;
    
    if (isRejected && index === currentIndex) {
      status = 'rejected';
      actor = 'System';
      date = new Date().toISOString().split('T')[0];
    } else if (index < currentIndex) {
      status = 'completed';
      if (step === 'Pending Manager') { actor = 'Sarah Connor'; date = '2026-06-25'; }
      if (step === 'Pending RFQ') { actor = 'AI Agent'; date = '2026-06-26'; }
      if (step === 'Pending Finance') { actor = 'John Smith'; date = '2026-06-27'; }
      if (step === 'Pending Executive') { actor = 'Jane Doe'; date = '2026-06-28'; }
    } else if (index === currentIndex && !isRejected) {
      status = 'current';
      if (step === 'Pending Manager') { actor = 'Sarah Connor'; }
      if (step === 'Pending RFQ') { actor = 'AI Agent'; }
      if (step === 'Pending Finance') { actor = 'John Smith'; }
      if (step === 'Pending Executive') { actor = 'Jane Doe'; }
    }

    return {
      id: step,
      label: step,
      status,
      actor,
      date
    };
  });
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function Intake() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const viewId = searchParams.get('id');

  const { intakes, setIntakes, updateIntake } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<IntakeRequest | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<IntakeRequest>>({});

  useEffect(() => {
    if (viewId) {
      const found = intakes.find(i => i.id === viewId);
      if (found) {
        setSelectedRequest(found);
        setEditData(found);
      }
    }
  }, [viewId, intakes]);

  const [newRequestData, setNewRequestData] = useState({
    title: '', department: '', amount: '', description: ''
  });

  const filteredIntakes = intakes.filter((req) => {
    if (filterParam === 'active' && (req.status === 'Draft' || req.status === 'PO Generated' || req.status === 'Rejected')) return false;
    if (filterParam === 'pending' && !(req.status === 'Pending Manager Approval' || req.status === 'Pending Finance Approval')) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      req.id.toLowerCase().includes(query) ||
      req.title.toLowerCase().includes(query) ||
      req.department.toLowerCase().includes(query) ||
      (req.supplier && req.supplier.toLowerCase().includes(query)) ||
      (req.description && req.description.toLowerCase().includes(query))
    );
  });

  const handleCreateRequest = () => {
    if (!newRequestData.title || !newRequestData.amount) {
      toast.error('Please fill in required fields (Title, Amount).');
      return;
    }
    const newId = `REQ-00${intakes.length + 1}`;
    const newReq = {
      id: newId,
      title: newRequestData.title,
      department: newRequestData.department || 'Unassigned',
      status: 'Draft',
      amount: newRequestData.amount,
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      description: newRequestData.description
    };
    updateIntake(newId, newReq);
    setIsNewRequestOpen(false);
    setNewRequestData({ title: '', department: '', amount: '', description: '' });
    toast.success('New intake request created successfully.');
  };

  const handleCreateAI = () => {
    setIsAgentDialogOpen(true);
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intake Management</h1>
          <p className="text-muted-foreground mt-2">Manage all purchase requests from idea to pay.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100" onClick={() => setIsAgentDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Draft Request
          </Button>
          <Button onClick={() => setIsNewRequestOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>A list of your recent procurement intakes.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID, title, or department..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIntakes.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>{req.amount}</TableCell>
                    <TableCell>{req.date}</TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
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
                            <DropdownMenuItem onClick={() => setSelectedRequest(req)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Request</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <SheetTitle className="text-2xl font-bold">{selectedRequest.id}</SheetTitle>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <SheetDescription className="text-base text-foreground font-medium">
                  {selectedRequest.title}
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Request Workflow</h3>
                  <ApprovalProcess steps={getApprovalSteps(selectedRequest.status)} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    {isEditing ? (
                      <Input value={editData.department || ''} onChange={e => setEditData({...editData, department: e.target.value})} className="h-8" />
                    ) : (
                      <p className="font-medium">{selectedRequest.department}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Requested Amount</p>
                    {isEditing ? (
                      <Input value={editData.amount || ''} onChange={e => setEditData({...editData, amount: e.target.value})} className="h-8" />
                    ) : (
                      <p className="font-medium">{selectedRequest.amount}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date Submitted</p>
                    <p className="font-medium">{selectedRequest.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target Supplier</p>
                    {isEditing ? (
                      <Input value={editData.supplier || ''} onChange={e => setEditData({...editData, supplier: e.target.value})} className="h-8" />
                    ) : (
                      <p className="font-medium">{selectedRequest.supplier || 'N/A'}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Description</h3>
                  {isEditing ? (
                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} />
                  ) : (
                    <p className="text-sm leading-relaxed">{selectedRequest.description}</p>
                  )}
                </div>
              </div>
              
              <SheetFooter className="mt-8 pt-4 border-t flex sm:justify-between items-center">
                <Button variant="outline" onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setSelectedRequest(null);
                  }
                }}>
                  {isEditing ? 'Cancel' : 'Close'}
                </Button>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button onClick={() => {
                      updateIntake(selectedRequest.id, editData);
                      setSelectedRequest({ ...selectedRequest, ...editData });
                      setIsEditing(false);
                      toast.success('Request updated.');
                    }}>Save Changes</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => {
                        setEditData(selectedRequest);
                        setIsEditing(true);
                      }}>Edit Info</Button>
                  {selectedRequest.status === 'Draft' && (
                    <Button onClick={() => {
                      updateIntake(selectedRequest.id, { status: 'Pending Manager Approval' });
                      setSelectedRequest({ ...selectedRequest, status: 'Pending Manager Approval' });
                      toast.success(`Submitted to Manager for approval.`);
                    }}>Submit to Manager</Button>
                  )}
                  {selectedRequest.status === 'Pending Manager Approval' && (
                    <>
                      <Button variant="destructive" onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'Rejected' });
                        setSelectedRequest({ ...selectedRequest, status: 'Rejected' });
                        toast.error(`Request rejected.`);
                      }}>Reject</Button>
                      <Button onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'Pending RFQ' });
                        setSelectedRequest({ ...selectedRequest, status: 'Pending RFQ' });
                        toast.success(`Approved by Manager. Moving to RFQ.`);
                      }}>Manager Approve</Button>
                    </>
                  )}
                  {selectedRequest.status === 'Pending RFQ' && (
                    <Button onClick={() => {
                      toast.info('AI is running RFQ to suggest suppliers...');
                      setTimeout(() => {
                        updateIntake(selectedRequest.id, { status: 'Pending Finance Approval', supplier: 'TechProcure Inc.' });
                        setSelectedRequest({ ...selectedRequest, status: 'Pending Finance Approval', supplier: 'TechProcure Inc.' });
                        toast.success(`AI suggested suppliers. Moving to Finance.`);
                      }, 2000);
                    }}>
                      <Bot className="mr-2 h-4 w-4" /> Generate AI RFQ
                    </Button>
                  )}
                  {selectedRequest.status === 'Pending Finance Approval' && (
                    <>
                      <Button variant="destructive" onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'Rejected' });
                        setSelectedRequest({ ...selectedRequest, status: 'Rejected' });
                        toast.error(`Request rejected by Finance.`);
                      }}>Reject</Button>
                      <Button onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'Pending Executive Approval' });
                        setSelectedRequest({ ...selectedRequest, status: 'Pending Executive Approval' });
                        toast.success(`Finance Approved! Moving to Executive.`);
                      }}>Finance Approve</Button>
                    </>
                  )}
                  {selectedRequest.status === 'Pending Executive Approval' && (
                    <>
                      <Button variant="destructive" onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'Rejected' });
                        setSelectedRequest({ ...selectedRequest, status: 'Rejected' });
                        toast.error(`Request rejected by Executive.`);
                      }}>Reject</Button>
                      <Button onClick={() => {
                        updateIntake(selectedRequest.id, { status: 'PO Generated' });
                        setSelectedRequest({ ...selectedRequest, status: 'PO Generated' });
                        toast.success(`Executive Approved! Purchase Order generated.`);
                      }}>Executive Approve (Generate PO)</Button>
                    </>
                  )}
                  {selectedRequest.status === 'PO Generated' && (
                    <Button variant="secondary" onClick={() => {
                      toast.info(`Viewing Purchase Order for ${selectedRequest.id}`);
                    }}>View PO</Button>
                  )}
                    </>
                  )}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Intake Request</DialogTitle>
            <DialogDescription>
              Fill out the details manually, or let the AI Agent help you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" className="w-full bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary" onClick={handleCreateAI}>
              <Sparkles className="mr-2 h-4 w-4" /> Auto-fill with AI Agent
            </Button>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={newRequestData.title}
                onChange={(e) => setNewRequestData({ ...newRequestData, title: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Q3 AWS Hosting"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Dept</Label>
              <Input
                id="department"
                value={newRequestData.department}
                onChange={(e) => setNewRequestData({ ...newRequestData, department: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                value={newRequestData.amount}
                onChange={(e) => setNewRequestData({ ...newRequestData, amount: e.target.value })}
                className="col-span-3"
                placeholder="e.g. $10,000"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">Desc</Label>
              <Textarea
                id="description"
                value={newRequestData.description}
                onChange={(e) => setNewRequestData({ ...newRequestData, description: e.target.value })}
                className="col-span-3 min-h-[80px]"
                placeholder="Brief justification..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AgentDialog 
        open={isAgentDialogOpen}
        onOpenChange={setIsAgentDialogOpen}
        contextType="intake"
        onSuccess={(data) => {
          const newId = `REQ-00${intakes.length + 1}`;
          const newReq = {
            id: newId,
            title: data.title,
            department: data.department,
            status: 'Draft',
            amount: data.amount,
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            description: data.description
          };
          updateIntake(newId, newReq);
          setIsAgentDialogOpen(false);
          setIsNewRequestOpen(false);
          toast.success('AI successfully created the request!');
        }}
      />
    </div>
  );
}
