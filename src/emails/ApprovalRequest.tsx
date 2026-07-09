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

interface ApprovalRequestProps {
  requesterName: string;
  requisitionTitle: string;
  amount: number;
  department: string;
  justification: string;
  requisitionId: string;
}

export default function ApprovalRequest({
  requesterName,
  requisitionTitle,
  amount,
  department,
  justification,
  requisitionId,
}: ApprovalRequestProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-50 font-sans">
          <Preview>Action Required: Approve {requisitionTitle} - ${amount.toLocaleString()}</Preview>
          <Container className="max-w-xl mx-auto p-6">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <Heading as="h1" className="text-xl font-bold text-gray-900 m-0">Procurely</Heading>
                  <Text className="text-sm text-gray-500 m-0">Approval Request</Text>
                </div>
              </div>
              <Hr className="border-gray-200 my-4" />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <Text className="text-amber-800 font-medium m-0">
                  ⚠️ Action Required
                </Text>
                <Text className="text-amber-700 text-sm m-0 mt-1">
                  {requesterName} has submitted a purchase requisition that requires your approval.
                </Text>
              </div>
            </Section>

            {/* Requisition Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-4">Requisition Details</Heading>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Title</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-gray-900 m-0">{requisitionTitle}</Text>
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
                  <Text className="text-sm text-gray-500 m-0">Department</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{department}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Requester</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{requesterName}</Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Justification</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{justification}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-center">
              <Button
                href={`${process.env.APP_URL || 'http://localhost:3000'}/requisitions`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium no-underline box-border"
              >
                Review & Approve
              </Button>
              <Text className="text-sm text-gray-500 m-0 mt-4">
                Please review the requisition and take action within 48 hours.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs text-gray-400 m-0">
                Requisition ID: {requisitionId}
              </Text>
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

ApprovalRequest.PreviewProps = {
  requesterName: 'Sarah Johnson',
  requisitionTitle: 'New Laptop for Engineering',
  amount: 2500,
  department: 'Engineering',
  justification: 'Required for new developer onboarding',
  requisitionId: 'REQ-2024-042',
} satisfies ApprovalRequestProps;

export { ApprovalRequest };
