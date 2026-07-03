import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, Search, MessageSquare, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { collection, query, getDocs, addDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'sonner';

import { RFQ, RFQQuestion, Bid } from '../types';

export function RFQs() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [bids, setBids] = useState<Record<string, Bid[]>>({});
  const [questions, setQuestions] = useState<Record<string, RFQQuestion[]>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRfq, setNewRfq] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchRFQsAndBids = async () => {
    try {
      const q = query(collection(db, 'rfqs'));
      const snapshot = await getDocs(q);
      const fetchedRfqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as RFQ[];
      fetchedRfqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRfqs(fetchedRfqs);

      // Fetch bids for these RFQs
      const bidsMap: Record<string, Bid[]> = {};
      const bidsQ = query(collection(db, 'bids'));
      const bidsSnapshot = await getDocs(bidsQ);
      const allBids = bidsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Bid[];
      
      allBids.forEach(bid => {
        if (!bidsMap[bid.rfqId]) bidsMap[bid.rfqId] = [];
        bidsMap[bid.rfqId].push(bid);
      });
      setBids(bidsMap);

      // Fetch questions
      const questionsMap: Record<string, RFQQuestion[]> = {};
      const qQ = query(collection(db, 'rfqQuestions'));
      const qSnapshot = await getDocs(qQ);
      const allQs = qSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as RFQQuestion[];
      
      allQs.forEach(q => {
        if (!questionsMap[q.rfqId]) questionsMap[q.rfqId] = [];
        questionsMap[q.rfqId].push(q);
      });
      setQuestions(questionsMap);

    } catch (error) {
      console.error("Error fetching RFQs", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRFQsAndBids();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRFQ = async () => {
    if (!auth.currentUser) return;
    if (!newRfq.title || !newRfq.description || !newRfq.dueDate) {
      toast.error("Please fill out all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'rfqs'), {
        title: newRfq.title,
        description: newRfq.description,
        dueDate: newRfq.dueDate,
        status: 'Published',
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        auditTrail: [{
          id: crypto.randomUUID(),
          action: 'Published RFQ',
          actorId: auth.currentUser.uid,
          timestamp: new Date().toISOString()
        }]
      });
      toast.success("RFQ Published Successfully");
      setIsCreateOpen(false);
      setNewRfq({ title: '', description: '', dueDate: '' });
      fetchRFQsAndBids();
    } catch (error) {
      console.error("Error creating RFQ", error);
      toast.error("Failed to publish RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAwardBid = async (rfqId: string, bidId: string) => {
    try {
      await updateDoc(doc(db, 'rfqs', rfqId), { status: 'Awarded' });
      await updateDoc(doc(db, 'bids', bidId), { status: 'Accepted' });
      
      // Update other bids for this RFQ to 'Rejected'
      const otherBids = bids[rfqId]?.filter(b => b.id !== bidId) || [];
      for (const bid of otherBids) {
        await updateDoc(doc(db, 'bids', bid.id), { status: 'Rejected' });
      }

      toast.success("Contract awarded successfully!");
      fetchRFQsAndBids();
    } catch (error) {
      console.error("Error awarding bid", error);
      toast.error("Failed to award bid");
    }
  };

  const handleAnswerQuestion = async (qId: string, isPublic: boolean) => {
    if (!replyText) return;
    try {
      await updateDoc(doc(db, 'rfqQuestions', qId), { 
        answer: replyText,
        isPublic
      });
      toast.success("Answer posted successfully");
      setReplyText('');
      setReplyingTo(null);
      fetchRFQsAndBids();
    } catch (error) {
      console.error("Error answering question", error);
      toast.error("Failed to post answer");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request for Quotations (RFQs)</h1>
          <p className="text-muted-foreground mt-1">Manage RFQs and compare vendor bids.</p>
        </div>
        
        <div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New RFQ
          </Button>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Request for Quotation</DialogTitle>
              <DialogDescription>
                Publish a new RFQ for vendors to bid on.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">RFQ Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Office Furniture Procurement" 
                  value={newRfq.title} 
                  onChange={e => setNewRfq({...newRfq, title: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={newRfq.dueDate} 
                  onChange={e => setNewRfq({...newRfq, dueDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description & Requirements</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the items, quantities, and specifications required..." 
                  className="h-32"
                  value={newRfq.description} 
                  onChange={e => setNewRfq({...newRfq, description: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRFQ} disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish RFQ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {rfqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No active RFQs</h3>
            <p className="text-muted-foreground">Create an RFQ to start receiving bids from vendors.</p>
          </div>
        ) : (
          rfqs.map(rfq => (
            <Card key={rfq.id}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{rfq.title}</CardTitle>
                    <CardDescription className="mt-1">Due: {new Date(rfq.dueDate).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={rfq.status === 'Awarded' ? 'default' : 'secondary'} className={rfq.status === 'Awarded' ? 'bg-green-500' : ''}>
                    {rfq.status === 'Awarded' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {rfq.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-6">{rfq.description}</p>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center justify-between border-b pb-2">
                    <span>Vendor Bids</span>
                    <Badge variant="outline">{bids[rfq.id]?.length || 0} Submitted</Badge>
                  </h4>
                  
                  {bids[rfq.id] && bids[rfq.id].length > 0 ? (
                    <div className="grid gap-3">
                      {bids[rfq.id]
                        .sort((a, b) => a.amount - b.amount)
                        .map((bid, index) => (
                        <div key={bid.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-slate-50 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{bid.vendorName}</span>
                              {index === 0 && rfq.status !== 'Awarded' && (
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Lowest Bid</Badge>
                              )}
                              {bid.status === 'Accepted' && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Winner</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bid.proposal}</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-lg font-bold">${bid.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</div>
                            </div>
                            {rfq.status === 'Published' && (
                              <Button size="sm" onClick={() => handleAwardBid(rfq.id, bid.id)}>
                                Award
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No bids received yet.</p>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold flex items-center justify-between border-b pb-2">
                    <span>Vendor Q&A</span>
                    <Badge variant="outline">{questions[rfq.id]?.length || 0} Questions</Badge>
                  </h4>
                  
                  {questions[rfq.id] && questions[rfq.id].length > 0 ? (
                    <div className="grid gap-4">
                      {questions[rfq.id].map(q => (
                        <div key={q.id} className="border rounded-lg p-4 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-slate-700">{q.vendorName} asks:</span>
                            <span className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm">{q.question}</p>
                          
                          {q.answer ? (
                            <div className="mt-3 pl-4 border-l-2 border-slate-300">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm text-blue-700">Your Answer:</span>
                                {q.isPublic && <Badge variant="secondary" className="text-[10px]">Publicly Visible</Badge>}
                                {!q.isPublic && <Badge variant="outline" className="text-[10px]">Visible to Vendor Only</Badge>}
                              </div>
                              <p className="text-sm">{q.answer}</p>
                            </div>
                          ) : (
                            <div className="mt-4 space-y-3">
                              {replyingTo === q.id ? (
                                <div className="space-y-2">
                                  <Textarea 
                                    placeholder="Type your answer here..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleAnswerQuestion(q.id, false)}>Reply to Vendor Only</Button>
                                    <Button size="sm" onClick={() => handleAnswerQuestion(q.id, true)}>Publish to All</Button>
                                  </div>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => setReplyingTo(q.id)}>Answer Question</Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No questions from vendors.</p>
                  )}
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
