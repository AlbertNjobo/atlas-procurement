import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

export async function logAuditEvent(
  action: string,
  entityId: string,
  entityType: string,
  beforeState: any,
  afterState: any,
  actorId: string
) {
  try {
    await addDoc(collection(db, 'audit_events'), {
      action,
      entityId,
      entityType,
      beforeState: beforeState || null,
      afterState: afterState || null,
      actorId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to write audit log', error);
  }
}
