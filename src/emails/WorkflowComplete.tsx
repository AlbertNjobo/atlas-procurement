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

interface WorkflowCompleteProps {
  workflowName: string;
  status: 'completed' | 'failed' | 'pending_approval';
  initiatedBy: string;
  totalSteps: number;
  completedSteps: number;
  summary: string;
}

export default function WorkflowComplete({
  workflowName,
  status,
  initiatedBy,
  totalSteps,
  completedSteps,
  summary,
}: WorkflowCompleteProps) {
  const statusConfig = {
    completed: { color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: 'Completed' },
    failed: { color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: 'Failed' },
    pending_approval: { color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', label: 'Awaiting Approval' },
  }[status];

  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-50 font-sans">
          <Preview>Workflow {statusConfig.label}: {workflowName}</Preview>
          <Container className="max-w-xl mx-auto p-6">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <Heading as="h1" className="text-xl font-bold text-gray-900 m-0">Procurely</Heading>
                  <Text className="text-sm text-gray-500 m-0">Workflow Notification</Text>
                </div>
              </div>
              <Hr className="border-gray-200 my-4" />
              <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-lg p-4 mb-4`}>
                <Text className={`${statusConfig.text} font-medium m-0`}>
                  {statusConfig.label}: {workflowName}
                </Text>
              </div>
            </Section>

            {/* Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <Heading as="h3" className="text-base font-semibold text-gray-800 m-0 mb-4">Workflow Details</Heading>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Workflow</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-medium text-gray-900 m-0">{workflowName}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Status</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className={`text-sm font-medium ${statusConfig.text} m-0`}>{statusConfig.label}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Initiated By</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{initiatedBy}</Text>
                </Column>
              </Row>
              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Progress</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{completedSteps} of {totalSteps} steps</Text>
                </Column>
              </Row>
              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-500 m-0">Summary</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{summary}</Text>
                </Column>
              </Row>
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

WorkflowComplete.PreviewProps = {
  workflowName: 'Standard Purchase',
  status: 'completed',
  initiatedBy: 'John Smith',
  totalSteps: 5,
  completedSteps: 5,
  summary: 'PO-2024-001 created and sent to vendor',
} satisfies WorkflowCompleteProps;

export { WorkflowComplete };
