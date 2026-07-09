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

interface RFQRequestProps {
  vendorName: string;
  rfqNumber: string;
  items: string;
  quantity: string;
  deliveryDate: string;
  deadline: string;
  specialRequirements?: string;
}

export default function RFQRequest({
  vendorName,
  rfqNumber,
  items,
  quantity,
  deliveryDate,
  deadline,
  specialRequirements,
}: RFQRequestProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-50 font-sans">
          <Preview>Request for Quotation {rfqNumber} from Procurely</Preview>
          <Container className="max-w-xl mx-auto p-6">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <Heading as="h1" className="text-xl font-bold text-gray-900 m-0">Procurely</Heading>
                  <Text className="text-sm text-gray-500 m-0">Request for Quotation</Text>
                </div>
              </div>
              <Hr className="border-gray-200 my-4" />
              <Heading as="h2" className="text-lg font-semibold text-gray-800 m-0 mb-2">
                RFQ: {rfqNumber}
              </Heading>
              <Text className="text-gray-600 m-0">
                Dear {vendorName},
              </Text>
              <Text className="text-gray-600 m-0">
                We are requesting a quotation for the following items. Please provide your best pricing and delivery terms.
              </Text>
            </Section>

            {/* RFQ Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-4">Quotation Details</Heading>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">RFQ Number</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-gray-900 m-0">{rfqNumber}</Text>
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
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Quantity</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{quantity}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Delivery Required</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{deliveryDate}</Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Response Deadline</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-orange-600 m-0">{deadline}</Text>
                </Column>
              </Row>
            </Section>

            {/* Special Requirements */}
            {specialRequirements && (
              <Section className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-4">
                <Text className="text-blue-800 font-medium text-sm m-0 mb-1">Special Requirements</Text>
                <Text className="text-blue-700 text-sm m-0">{specialRequirements}</Text>
              </Section>
            )}

            {/* CTA */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-center">
              <Button
                href={`${process.env.APP_URL || 'http://localhost:3000'}/rfqs`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium no-underline box-border"
              >
                Submit Quotation
              </Button>
              <Text className="text-sm text-gray-500 m-0 mt-4">
                Please submit your quotation by {deadline}.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs text-gray-400 m-0">
                This is an automated request from Procurely Procurement Platform.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

RFQRequest.PreviewProps = {
  vendorName: 'TechSupply Co.',
  rfqNumber: 'RFQ-2024-089',
  items: '100x Ergonomic Keyboards, 100x Wireless Mice',
  quantity: '100 units each',
  deliveryDate: 'February 15, 2025',
  deadline: 'January 30, 2025',
  specialRequirements: 'Must be compatible with Windows 11 and macOS',
} satisfies RFQRequestProps;

export { RFQRequest };
