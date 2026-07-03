import { useState, useCallback } from 'react';
import { PurchaseOrder, GoodsReceipt, Invoice } from '../types';

export function useMatchValidator() {
  const [matchStatus, setMatchStatus] = useState<'pending' | 'matched' | 'failed'>('pending');
  const [matchErrors, setMatchErrors] = useState<string[]>([]);

  const validate3WayMatch = useCallback((po: any | null, receipt: GoodsReceipt | null, invoice: Invoice | null) => {
    const errors: string[] = [];
    
    if (!po) {
      errors.push("Missing Purchase Order.");
    }
    if (!receipt) {
      errors.push("Missing Goods Receipt.");
    }
    if (!invoice) {
      errors.push("Missing Invoice.");
    }

    if (po && receipt && invoice) {
      const poAmount = po.amount || 0;
      const invAmount = invoice.amount || 0;
      
      const poQuantity = po.quantity || 1;
      const receivedQuantity = receipt.quantityReceived || 0;

      if (invAmount !== poAmount) {
        errors.push(`Amount mismatch: PO amount is $${poAmount}, Invoice amount is $${invAmount}.`);
      }
      
      if (receivedQuantity !== poQuantity) {
         errors.push(`Quantity mismatch: PO quantity is ${poQuantity}, Receipt quantity is ${receivedQuantity}.`);
      }
    }

    setMatchErrors(errors);
    
    if (errors.length === 0 && po && receipt && invoice) {
      setMatchStatus('matched');
      return { isValid: true, errors: [] };
    } else {
      setMatchStatus('failed');
      return { isValid: false, errors };
    }
  }, []);

  return { validate3WayMatch, matchStatus, matchErrors };
}
