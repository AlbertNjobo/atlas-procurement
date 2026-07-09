import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from 'react-email';

interface PONotificationProps {
  poNumber: string;
  amount: number;
  items: string;
  vendorName: string;
  dueDate?: string;
}

export default function PONotification({
  poNumber,
  amount,
  items,
  vendorName,
  dueDate = 'Upon receipt',
}: PONotificationProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-50 font-sans">
          <Preview>Purchase Order {poNumber} from Procurely - ${amount.toLocaleString()}</Preview>
          <Container className="max-w-xl mx-auto p-6">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <Heading as="h1" className="text-xl font-bold text-gray-900 m-0">Procurely</Heading>
                  <Text className="text-sm text-gray-500 m-0">Purchase Order</Text>
                </div>
              </div>
              <Hr className="border-gray-200 my-4" />
              <Heading as="h2" className="text-lg font-semibold text-gray-800 m-0 mb-2">
                New Purchase Order: {poNumber}
              </Heading>
              <Text className="text-gray-600 m-0">
                Dear {vendorName},
              </Text>
              <Text className="text-gray-600 m-0">
                You have received a new purchase order from Procurely. Please review the details below and confirm receipt.
              </Text>
            </Section>

            {/* Order Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-4">Order Details</Heading>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">PO Number</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-gray-900 m-0">{poNumber}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Amount</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-semibold text-green-600 m-0">${amount.toLocaleString()}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Items</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{items}</Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Payment Terms</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{dueDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-center">
              <Button
                href={`${process.env.APP_URL || 'http://localhost:3000'}/vendors`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium no-underline box-border"
              >
                View Purchase Order
              </Button>
              <Text className="text-sm text-gray-500 m-0 mt-4">
                Please confirm receipt and provide an estimated delivery date.
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

PONotification.PreviewProps = {
  poNumber: 'PO-2024-001',
  amount: 12500,
  items: '50x Ergonomic Keyboards, 50x Wireless Mice',
  vendorName: 'TechSupply Co.',
  dueDate: 'Net 30',
} satisfies PONotificationProps;

export { PONotification };
