import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, FileText, CreditCard, MessageSquare, Plus, Download, Send, Search, CheckCircle2, ShoppingCart, Tag, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../lib/auth-context';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { RFQ } from '../types';

export function VendorPortal() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const { user } = useAuth();
  
  // Onboarding Form State
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [certifications, setCertifications] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnboarding, setSubmittedOnboarding] = useState<any>(null);

  // Catalog State
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // RFQ & Bids State
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [vendorBids, setVendorBids] = useState<Record<string, any>>({});
  const [vendorQuestions, setVendorQuestions] = useState<Record<string, any[]>>({});
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [isBidding, setIsBidding] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const checkOnboarding = async () => {
        try {
          const q = query(collection(db, 'vendorOnboarding'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setSubmittedOnboarding({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
            setActiveTab('orders'); // Default to orders if already onboarded
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      };
      checkOnboarding();
    }
  }, [user]);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'vendorOnboarding'), {
        companyName,
        taxId,
        certifications,
        status: 'Pending Review',
        userId: user.uid
      });
      setSubmittedOnboarding({
        id: docRef.id,
        companyName,
        taxId,
        certifications,
        status: 'Pending Review',
        userId: user.uid
      });
    } catch (error) {
      console.error("Error submitting onboarding form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchCatalogItems = async () => {
        try {
          const q = query(collection(db, 'procurementCatalog'), where('vendorId', '==', user.uid));
          const snapshot = await getDocs(q);
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCatalogItems(items);
        } catch (error) {
          console.error("Error fetching catalog items:", error);
        }
      };
      fetchCatalogItems();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'rfqs') {
      const fetchRFQsAndBids = async () => {
        try {
          const rfqQ = query(collection(db, 'rfqs'), where('status', 'in', ['Published', 'Awarded']));
          const rfqSnap = await getDocs(rfqQ);
          const fetchedRfqs = rfqSnap.docs.map(d => ({ id: d.id, ...d.data() })) as RFQ[];
          
          fetchedRfqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRfqs(fetchedRfqs);

          const bidsQ = query(collection(db, 'bids'), where('vendorId', '==', user.uid));
          const bidsSnap = await getDocs(bidsQ);
          const bidsMap: Record<string, any> = {};
          bidsSnap.docs.forEach(d => {
            const data = d.data();
            bidsMap[data.rfqId] = { id: d.id, ...data };
          });
          setVendorBids(bidsMap);

          // Fetch questions (public ones + own private ones)
          const qQ = query(collection(db, 'rfqQuestions'));
          const qSnap = await getDocs(qQ);
          const qMap: Record<string, any[]> = {};
          qSnap.docs.forEach(d => {
            const data = d.data();
            // Show if it's public OR if it belongs to this vendor
            if (data.isPublic || data.vendorId === user.uid) {
              if (!qMap[data.rfqId]) qMap[data.rfqId] = [];
              qMap[data.rfqId].push({ id: d.id, ...data });
            }
          });
          setVendorQuestions(qMap);

        } catch (error) {
          console.error("Error fetching RFQs for vendor:", error);
        }
      };
      fetchRFQsAndBids();
    }
  }, [user, activeTab]);

  const handleBidSubmit = async (rfqId: string) => {
    if (!user || !submittedOnboarding) return;
    if (!bidAmount || !bidProposal) {
      toast.error('Please provide a bid amount and proposal.');
      return;
    }
    setIsBidding(rfqId);
    try {
      const newBid = {
        rfqId,
        vendorId: user.uid,
        vendorName: submittedOnboarding.companyName,
        amount: parseFloat(bidAmount),
        proposal: bidProposal,
        status: 'Submitted',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'bids'), newBid);
      setVendorBids(prev => ({ ...prev, [rfqId]: { id: docRef.id, ...newBid } }));
      setBidAmount('');
      setBidProposal('');
      toast.success('Bid submitted successfully');
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid');
    } finally {
      setIsBidding(null);
    }
  };

  const handleAskQuestion = async (rfqId: string) => {
    if (!user || !submittedOnboarding || !questionText) return;
    setIsAsking(rfqId);
    try {
      const newQ = {
        rfqId,
        vendorId: user.uid,
        vendorName: submittedOnboarding.companyName,
        question: questionText,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'rfqQuestions'), newQ);
      setVendorQuestions(prev => {
        const existing = prev[rfqId] || [];
        return { ...prev, [rfqId]: [...existing, { id: docRef.id, ...newQ }] };
      });
      setQuestionText('');
      toast.success('Question posted successfully');
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error('Failed to post question');
    } finally {
      setIsAsking(null);
    }
  };

  const handleAddCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAddingItem(true);
    try {
      const newItem = {
        name: newItemName,
        description: newItemDescription,
        price: parseFloat(newItemPrice) || 0,
        category: newItemCategory,
        vendorId: user.uid,
        vendorName: submittedOnboarding?.companyName || 'Unknown Vendor',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'procurementCatalog'), newItem);
      setCatalogItems([...catalogItems, { id: docRef.id, ...newItem }]);
      setNewItemName('');
      setNewItemDescription('');
      setNewItemPrice('');
      setNewItemCategory('');
    } catch (error) {
      console.error("Error adding catalog item:", error);
    } finally {
      setIsAddingItem(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-4 mb-6 flex items-start gap-3">
        <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800 dark:text-amber-400">External Vendor View</h3>
          <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mt-1">
            This page represents what external suppliers see. In a production environment, this would be a separate application or portal requiring vendor authentication. Here, they can respond to RFQs, ask questions, and manage their catalog.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Portal</h1>
          <p className="text-muted-foreground mt-1">Manage orders, invoices, and collaboration with buyers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">4 pending fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">$45,200.00 total value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,500.00</div>
            <p className="text-xs text-muted-foreground mt-1">Processed this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs & Bids</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="onboarding" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Vendor Onboarding</CardTitle>
              <CardDescription>Submit your details to become an approved supplier.</CardDescription>
            </CardHeader>
            {submittedOnboarding ? (
              <CardContent className="space-y-4 flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold">Application Submitted!</h3>
                <p className="text-muted-foreground max-w-md">
                  Thank you for submitting your onboarding details. Your application for <strong>{submittedOnboarding.companyName}</strong> is currently <Badge variant="outline" className="bg-yellow-50 text-yellow-700 ml-1">{submittedOnboarding.status}</Badge>.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Our procurement team will review your details and reach out if additional information is needed.
                </p>
              </CardContent>
            ) : (
              <form onSubmit={handleOnboardingSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="companyName" 
                      placeholder="e.g. Acme Corporation" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax Identification Number (TIN/EIN) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="taxId" 
                      placeholder="XX-XXXXXXX" 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications & Compliance (Optional)</Label>
                    <Textarea 
                      id="certifications" 
                      placeholder="List any relevant ISO certifications, minority-owned business status, etc." 
                      className="min-h-[100px]"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">This helps our team categorize and prioritize your profile.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button type="submit" disabled={isSubmitting || !companyName || !taxId}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catalog Management</CardTitle>
              <CardDescription>Manage your products and services available to buyers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {submittedOnboarding ? (
                <>
                  <form onSubmit={handleAddCatalogItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-muted/50 p-4 rounded-lg border">
                    <div className="space-y-2 lg:col-span-1">
                      <Label htmlFor="itemName">Item Name</Label>
                      <Input id="itemName" value={newItemName} onChange={e => setNewItemName(e.target.value)} required placeholder="Item name" />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <Label htmlFor="itemCategory">Category</Label>
                      <Input id="itemCategory" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} required placeholder="e.g., Software, Hardware" />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <Label htmlFor="itemPrice">Price ($)</Label>
                      <Input id="itemPrice" type="number" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required placeholder="0.00" />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <Label htmlFor="itemDescription">Description</Label>
                      <Input id="itemDescription" value={newItemDescription} onChange={e => setNewItemDescription(e.target.value)} placeholder="Brief description" />
                    </div>
                    <div className="lg:col-span-1">
                      <Button type="submit" className="w-full" disabled={isAddingItem || !newItemName || !newItemPrice}>
                        {isAddingItem ? 'Adding...' : 'Add Item'}
                      </Button>
                    </div>
                  </form>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No items in your catalog yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        catalogItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{item.description}</TableCell>
                            <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Onboarding Required</h3>
                  <p className="text-muted-foreground mt-1">Please complete your vendor onboarding before managing your catalog.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('onboarding')}>Go to Onboarding</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>View and manage your active purchase orders.</CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
                <Input type="text" placeholder="Search orders..." />
                <Button type="submit" variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-001</TableCell>
                    <TableCell>2024-05-15</TableCell>
                    <TableCell>$15,000.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-002</TableCell>
                    <TableCell>2024-05-10</TableCell>
                    <TableCell>$8,500.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fulfilled</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-003</TableCell>
                    <TableCell>2024-04-28</TableCell>
                    <TableCell>$22,400.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Submit and track invoice statuses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">INV-1042</TableCell>
                    <TableCell>PO-2024-002</TableCell>
                    <TableCell>2024-05-12</TableCell>
                    <TableCell>$8,500.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Under Review</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV-1041</TableCell>
                    <TableCell>PO-2024-003</TableCell>
                    <TableCell>2024-05-01</TableCell>
                    <TableCell>$22,400.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track completed and scheduled payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Ref</TableHead>
                    <TableHead>Invoice Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PAY-5091</TableCell>
                    <TableCell>INV-1039</TableCell>
                    <TableCell>2024-04-15</TableCell>
                    <TableCell>$12,500.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PAY-5092</TableCell>
                    <TableCell>INV-1041</TableCell>
                    <TableCell>2024-05-20 (Est)</TableCell>
                    <TableCell>$22,400.00</TableCell>
                    <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requests for Quotation (RFQs)</CardTitle>
              <CardDescription>View open RFQs and submit your bids.</CardDescription>
            </CardHeader>
            <CardContent>
              {submittedOnboarding ? (
                <div className="grid gap-4">
                  {rfqs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No RFQs available right now.</p>
                  ) : (
                    rfqs.map(rfq => {
                      const myBid = vendorBids[rfq.id];
                      return (
                        <Card key={rfq.id} className="bg-slate-50 border-dashed">
                          <CardContent className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg">{rfq.title}</h4>
                                <Badge variant="outline">{rfq.status}</Badge>
                              </div>
                              <p className="text-sm">{rfq.description}</p>
                              <p className="text-xs text-muted-foreground">Due: {new Date(rfq.dueDate).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="shrink-0 w-full md:w-auto">
                              {myBid ? (
                                <div className="bg-white p-3 rounded-md border text-sm space-y-1 w-full md:w-64">
                                  <div className="flex justify-between font-semibold">
                                    <span>Your Bid:</span>
                                    <span>${myBid.amount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground text-xs">
                                    <span>Status:</span>
                                    <span className={myBid.status === 'Accepted' ? 'text-green-600 font-bold' : myBid.status === 'Rejected' ? 'text-red-600' : ''}>{myBid.status}</span>
                                  </div>
                                </div>
                              ) : rfq.status === 'Published' ? (
                                <Dialog>
                                  <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                    Submit Bid
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Submit Bid for {rfq.title}</DialogTitle>
                                      <DialogDescription>
                                        Provide your best price and a short proposal.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Bid Amount ($)</Label>
                                        <Input 
                                          type="number" 
                                          placeholder="0.00" 
                                          value={bidAmount} 
                                          onChange={e => setBidAmount(e.target.value)} 
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Proposal Summary</Label>
                                        <Textarea 
                                          placeholder="Explain why your company is the best fit, expected delivery time, etc." 
                                          value={bidProposal}
                                          onChange={e => setBidProposal(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        onClick={() => handleBidSubmit(rfq.id)} 
                                        disabled={isBidding === rfq.id || !bidAmount}
                                      >
                                        {isBidding === rfq.id ? 'Submitting...' : 'Submit Bid'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Badge variant="secondary" className="w-full justify-center">Closed</Badge>
                              )}
                            </div>
                          </CardContent>

                          {/* Vendor Q&A Section */}
                          <div className="border-t px-4 py-3 bg-white/50">
                            <h5 className="font-semibold text-sm mb-3">Q&A Thread</h5>
                            <div className="space-y-3 mb-4">
                              {vendorQuestions[rfq.id] && vendorQuestions[rfq.id].length > 0 ? (
                                vendorQuestions[rfq.id].map(q => (
                                  <div key={q.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                                    <div className="font-medium text-slate-700">{q.vendorName} {q.vendorId === user?.uid ? "(You)" : ""} asks:</div>
                                    <p>{q.question}</p>
                                    {q.answer ? (
                                      <div className="mt-2 pl-3 border-l-2 border-slate-300">
                                        <div className="text-xs font-semibold text-blue-700">Answer:</div>
                                        <p className="text-muted-foreground">{q.answer}</p>
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-xs text-muted-foreground italic">Awaiting response from buyer...</div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No questions asked yet.</p>
                              )}
                            </div>
                            
                            {rfq.status === 'Published' && (
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="Ask a question about this RFQ..." 
                                  value={questionText}
                                  onChange={e => setQuestionText(e.target.value)}
                                  className="h-8 text-sm"
                                />
                                <Button size="sm" onClick={() => handleAskQuestion(rfq.id)} disabled={isAsking === rfq.id || !questionText}>
                                  {isAsking === rfq.id ? 'Posting...' : 'Ask'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Onboarding Required</h3>
                  <p className="text-muted-foreground mt-1">Please complete your vendor onboarding before bidding on RFQs.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('onboarding')}>Go to Onboarding</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Collaboration Hub</CardTitle>
              <CardDescription>Directly communicate with procurement teams and resolve issues faster.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[400px] border rounded-md">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm font-medium mb-1">Procurement Team</p>
                      <p className="text-sm">Could you please update the delivery timeline for PO-2024-001?</p>
                      <p className="text-xs text-muted-foreground mt-2">Yesterday, 14:30</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm font-medium mb-1">You</p>
                      <p className="text-sm">We are experiencing a slight delay in logistics. The new estimated delivery is May 25th. I will update the order details accordingly.</p>
                      <p className="text-xs text-primary-foreground/70 mt-2">Yesterday, 15:15</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t mt-auto">
                  <form className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
