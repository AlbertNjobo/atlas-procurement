import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Tag, Filter, Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendorId: string;
  vendorName: string;
}

interface CartItem extends CatalogItem {
  quantity: number;
}

export function ProcurementCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('Consumption');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'archive') => {
    if (selectedIds.size === 0) return;
    try {
      const promises = Array.from(selectedIds).map(id => {
        const status = action === 'approve' ? 'Approved' : 'Archived';
        return updateDoc(doc(db, 'procurementCatalog', id), { status });
      });
      await Promise.all(promises);
      toast.success(`Successfully ${action}d ${selectedIds.size} items.`);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error(`Failed to bulk ${action} items.`);
    }
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'procurementCatalog'));
        const catalogItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CatalogItem[];
        setItems(catalogItems);
      } catch (error) {
        console.error("Error fetching catalog items:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCatalog();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast("Added to cart", {
      description: `${item.name} added to your requisition.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitRequisition = async () => {
    if (!auth.currentUser) return;
    if (cart.length === 0 || !title || !reason) {
      toast("Validation Error", { description: "Please fill out all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'purchaseRequisitions'), {
        title,
        status: 'Draft',
        purpose,
        reason,
        totalAmount,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid,
      });
      
      // Usually we would also save the lines in a subcollection, but for this demo, 
      // saving the header is enough or we could add a simplified "lines" array if it was in the blueprint.
      
      toast("Success", { description: "Purchase requisition drafted successfully." });
      setCart([]);
      setIsCartOpen(false);
      setTitle('');
      setReason('');
    } catch (error) {
      console.error(error);
      toast("Error", { description: "Failed to submit requisition." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Catalog</h1>
          <p className="text-muted-foreground mt-1">Browse and request items from approved vendors.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            View Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, descriptions, or vendors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            All Items
          </Button>
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              <Tag className="mr-2 h-3 w-3" />
              {category}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No items found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or category filters.</p>
          {(searchTerm || selectedCategory) && (
            <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory(null); }} className="mt-2">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300"
                    checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id} className={selectedIds.has(item.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell>{item.vendorName}</TableCell>
                  <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => addToCart(item)}>
                      <Plus className="mr-2 h-4 w-4" /> Request
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Requisition Cart</DialogTitle>
            <DialogDescription>Review your items and create a purchase requisition.</DialogDescription>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Your cart is empty. Add some items from the catalog.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">${Number(item.price).toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Requisition Details</h3>
                <div className="space-y-2">
                  <Label>Requisition Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Office Supplies" />
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consumption">Consumption</SelectItem>
                      <SelectItem value="Replenishment">Replenishment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Justification *</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are these items needed?" />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>Cancel</Button>
            <Button onClick={submitRequisition} disabled={cart.length === 0 || submitting}>
              {submitting ? "Drafting..." : "Draft Requisition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background border shadow-lg px-6 py-4 rounded-full"
          >
            <span className="text-sm font-medium">
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <Button size="sm" onClick={() => handleBulkAction('approve')}>Bulk Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>Bulk Archive</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
