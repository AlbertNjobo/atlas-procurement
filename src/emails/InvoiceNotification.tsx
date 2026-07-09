import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from 'react-email';

interface InvoiceNotificationProps {
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  poNumber: string;
  dueDate: string;
}

export default function InvoiceNotification({
  invoiceNumber,
  vendorName,
  amount,
  poNumber,
  dueDate,
}: InvoiceNotificationProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-50 font-sans">
          <Preview>Invoice {invoiceNumber} from {vendorName} - ${amount.toLocaleString()}</Preview>
          <Container className="max-w-xl mx-auto p-6">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <Heading as="h1" className="text-xl font-bold text-gray-900 m-0">Procurely</Heading>
                  <Text className="text-sm text-gray-500 m-0">Invoice Received</Text>
                </div>
              </div>
              <Hr className="border-gray-200 my-4" />
              <Heading as="h2" className="text-lg font-semibold text-gray-800 m-0 mb-2">
                New Invoice: {invoiceNumber}
              </Heading>
              <Text className="text-gray-600 m-0">
                An invoice has been received from {vendorName} and is ready for processing.
              </Text>
            </Section>

            {/* Invoice Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-4">Invoice Details</Heading>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Invoice Number</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-gray-900 m-0">{invoiceNumber}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Vendor</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{vendorName}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Amount</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-semibold text-gray-900 m-0">${amount.toLocaleString()}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">PO Number</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{poNumber}</Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Due Date</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-orange-600 m-0">{dueDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* Next Steps */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-3">Next Steps</Heading>
              <Text className="text-sm text-gray-600 m-0 mb-2">
                1. Verify the invoice against the purchase order
              </Text>
              <Text className="text-sm text-gray-600 m-0 mb-2">
                2. Complete three-way match (PO, receipt, invoice)
              </Text>
              <Text className="text-sm text-gray-600 m-0">
                3. Process for payment if all matches
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs text-gray-400 m-0">
                This is an automated notification from Procurely Procurement Platform.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

InvoiceNotification.PreviewProps = {
  invoiceNumber: 'INV-2024-1234',
  vendorName: 'Office Supplies Inc.',
  amount: 3450,
  poNumber: 'PO-2024-089',
  dueDate: 'January 15, 2025',
} satisfies InvoiceNotificationProps;

export { InvoiceNotification };
