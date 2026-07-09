/**
 * Email sender using Resend + React Email templates
 * Follows Resend best practices: idempotency keys, error handling, server-side only
 */
import { Resend } from 'resend';
import { render } from 'react-email';
import { PONotification } from '../emails/PONotification';
import { ApprovalRequest } from '../emails/ApprovalRequest';
import { InvoiceNotification } from '../emails/InvoiceNotification';
import { WorkflowComplete } from '../emails/WorkflowComplete';
import { RFQRequest } from '../emails/RFQRequest';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Procurely <notifications@procurely.dpdns.org>';

export interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a single email via Resend
 * Key gotcha: Resend SDK returns { data, error }, does NOT throw
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, idempotencyKey } = params;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  }, idempotencyKey ? { idempotencyKey } : undefined);

  if (error) {
    console.error('Resend email error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}

/**
 * Send PO notification to vendor using React Email template
 */
export async function sendPONotification(
  vendorEmail: string,
  poNumber: string,
  amount: number,
  items: string,
  vendorName: string = 'Valued Vendor',
  dueDate?: string
): Promise<SendEmailResult> {
  const html = await render(
    PONotification({ poNumber, amount, items, vendorName, dueDate })
  );

  return sendEmail({
    to: [vendorEmail],
    subject: `Purchase Order ${poNumber} from Procurely`,
    html,
    idempotencyKey: `po-notification/${poNumber}`,
  });
}

/**
 * Send approval request to manager using React Email template
 */
export async function sendApprovalRequest(
  managerEmail: string,
  requesterName: string,
  requisitionTitle: string,
  amount: number,
  requisitionId: string,
  department: string = 'General',
  justification: string = 'Purchase required'
): Promise<SendEmailResult> {
  const html = await render(
    ApprovalRequest({ requesterName, requisitionTitle, amount, department, justification, requisitionId })
  );

  return sendEmail({
    to: [managerEmail],
    subject: `Approval Required: ${requisitionTitle} ($${amount.toLocaleString()})`,
    html,
    idempotencyKey: `approval-request/${requisitionId}`,
  });
}

/**
 * Send invoice received notification using React Email template
 */
export async function sendInvoiceNotification(
  accountsEmail: string,
  vendorName: string,
  invoiceNumber: string,
  amount: number,
  poNumber: string,
  dueDate: string = 'Upon receipt'
): Promise<SendEmailResult> {
  const html = await render(
    InvoiceNotification({ invoiceNumber, vendorName, amount, poNumber, dueDate })
  );

  return sendEmail({
    to: [accountsEmail],
    subject: `Invoice ${invoiceNumber} from ${vendorName} - $${amount.toLocaleString()}`,
    html,
    idempotencyKey: `invoice-notification/${invoiceNumber}`,
  });
}

/**
 * Send workflow completion notification using React Email template
 */
export async function sendWorkflowComplete(
  userEmail: string,
  workflowName: string,
  status: 'completed' | 'failed' | 'pending_approval',
  initiatedBy: string = 'System',
  totalSteps: number = 0,
  completedSteps: number = 0,
  summary: string = 'Workflow execution finished'
): Promise<SendEmailResult> {
  const html = await render(
    WorkflowComplete({ workflowName, status, initiatedBy, totalSteps, completedSteps, summary })
  );

  return sendEmail({
    to: [userEmail],
    subject: `Workflow ${status === 'completed' ? 'Complete' : status === 'failed' ? 'Failed' : 'Needs Approval'}: ${workflowName}`,
    html,
    idempotencyKey: `workflow-${status}/${workflowName}/${Date.now()}`,
  });
}

/**
 * Send RFQ request to vendor using React Email template
 */
export async function sendRFQRequest(
  vendorEmail: string,
  vendorName: string,
  rfqNumber: string,
  items: string,
  quantity: string,
  deliveryDate: string,
  deadline: string,
  specialRequirements?: string
): Promise<SendEmailResult> {
  const html = await render(
    RFQRequest({ vendorName, rfqNumber, items, quantity, deliveryDate, deadline, specialRequirements })
  );

  return sendEmail({
    to: [vendorEmail],
    subject: `Request for Quotation ${rfqNumber} from Procurely`,
    html,
    idempotencyKey: `rfq-request/${rfqNumber}`,
  });
}
