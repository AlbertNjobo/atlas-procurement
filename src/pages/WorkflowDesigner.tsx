import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFormAutoSave } from '../hooks/useFormAutoSave';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  Panel,
  Handle,
  Position,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Play, FileText, GitFork, Save, Network, Waypoints, Plus, Trash2, Square } from 'lucide-react';
import { toast } from 'sonner';

// Custom Nodes

const TriggerNode = ({ data }: { data: any }) => (
  <div className="bg-background border-2 border-primary rounded-lg shadow-md p-3 min-w-[150px]">
    <div className="flex items-center gap-2 mb-2 font-bold text-sm text-primary">
      <Play className="h-4 w-4" />
      {data.label}
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
  </div>
);

const ActionNode = ({ data }: { data: any }) => (
  <div className="bg-background border-2 border-blue-500 rounded-lg shadow-md p-3 min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
    <div className="flex items-center gap-2 mb-2 font-bold text-sm text-blue-600">
      <FileText className="h-4 w-4" />
      {data.label}
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
  </div>
);

const ConditionNode = ({ data }: { data: any }) => (
  <div className="bg-background border-2 border-amber-500 rounded-lg shadow-md p-3 min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
    <div className="flex items-center gap-2 mb-2 font-bold text-sm text-amber-600">
      <GitFork className="h-4 w-4" />
      {data.label}
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-green-500 left-1/3" />
    <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-red-500 left-2/3" />
  </div>
);

const RoutingNode = ({ data }: { data: any }) => {
  const routes = data.routes || [{ id: 'default', label: 'Default' }];
  
  return (
    <div className="bg-background border-2 border-purple-500 rounded-lg shadow-md p-3 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center gap-2 mb-2 font-bold text-sm text-purple-600">
        <Waypoints className="h-4 w-4" />
        {data.label}
      </div>
      <div className="text-xs text-muted-foreground mb-4">{data.description}</div>
      <div className="flex flex-col gap-1 w-full text-xs">
        {routes.map((route: any, index: number) => {
          const leftPos = `${((index + 1) / (routes.length + 1)) * 100}%`;
          return (
            <div key={route.id} className="flex justify-between items-center text-muted-foreground">
              <span>{route.label}</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id={route.id}
                style={{ left: leftPos }}
                className="w-3 h-3 bg-purple-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  routing: RoutingNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'New Intake Request', description: 'When a new request is submitted' },
  },
];

const templates = {
  standard: {
    nodes: [
      { id: 't1-1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Intake Request', description: 'When a standard request is submitted', eventType: 'on_submit' } },
      { id: 't1-2', type: 'condition', position: { x: 250, y: 150 }, data: { label: 'Amount > $10,000', description: 'Check request total', threshold: '10000' } },
      { id: 't1-3', type: 'action', position: { x: 100, y: 300 }, data: { label: 'Generate PO', description: 'Auto-create Purchase Order' } },
      { id: 't1-4', type: 'action', position: { x: 400, y: 300 }, data: { label: 'Manager Approval', description: 'Route to Procurement Manager', role: 'procurement_manager' } },
    ],
    edges: [
      { id: 'e1-1-2', source: 't1-1', target: 't1-2' },
      { id: 'e1-2-3', source: 't1-2', target: 't1-3', sourceHandle: 'false', label: 'No' },
      { id: 'e1-2-4', source: 't1-2', target: 't1-4', sourceHandle: 'true', label: 'Yes' },
    ]
  },
  capex: {
    nodes: [
      { id: 't2-1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'CapEx Request', description: 'When a Capital Expenditure is submitted' } },
      { id: 't2-2', type: 'action', position: { x: 250, y: 150 }, data: { label: 'Dept Head Approval', description: 'Initial review', role: 'department_head' } },
      { id: 't2-3', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'Approved?', description: 'Did Department Head approve?' } },
      { id: 't2-4', type: 'action', position: { x: 100, y: 400 }, data: { label: 'Finance Director', description: 'Final financial review', role: 'finance_director' } },
      { id: 't2-5', type: 'action', position: { x: 400, y: 400 }, data: { label: 'Reject Request', description: 'Notify submitter' } },
    ],
    edges: [
      { id: 'e2-1-2', source: 't2-1', target: 't2-2' },
      { id: 'e2-2-3', source: 't2-2', target: 't2-3' },
      { id: 'e2-3-4', source: 't2-3', target: 't2-4', sourceHandle: 'true', label: 'Yes' },
      { id: 'e2-3-5', source: 't2-3', target: 't2-5', sourceHandle: 'false', label: 'No' },
    ]
  }
};

let id = 0;
const getId = () => `dndnode_${Date.now()}_${id++}`;

const LOCAL_STORAGE_KEY = 'workflow-designer-autosave';

const Designer = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Load saved workflow or fallback to initial
  const initialFlow = React.useMemo(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved workflow:', e);
    }
    return { nodes: initialNodes, edges: [] };
  }, []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const { screenToFlowPosition } = useReactFlow();

  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save on change
  useEffect(() => {
    if (!isSimulating) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges, isSimulating]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) clearTimeout(simulationRef.current);
    setIsSimulating(false);
    setNodes(nds => nds.map(n => ({ ...n, className: '' })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: undefined, strokeWidth: undefined } })));
  }, [setNodes, setEdges]);

  const startSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      toast.error('No trigger node found to start simulation');
      return;
    }

    setIsSimulating(true);
    
    let currentNodes = triggerNodes.map(n => n.id);
    
    const runStep = (nodesToActivate: string[]) => {
      setNodes(nds => nds.map(n => ({
        ...n,
        className: nodesToActivate.includes(n.id) ? 'ring-4 ring-primary ring-offset-2 transition-all duration-300' : ''
      })));

      const outgoingEdges = edges.filter(e => nodesToActivate.includes(e.source));
      
      setEdges(eds => eds.map(e => ({
        ...e,
        animated: outgoingEdges.some(oe => oe.id === e.id),
        style: outgoingEdges.some(oe => oe.id === e.id) ? { stroke: 'hsl(var(--primary))', strokeWidth: 2 } : { stroke: undefined, strokeWidth: undefined }
      })));

      if (outgoingEdges.length === 0) {
        simulationRef.current = setTimeout(() => {
           stopSimulation();
           toast.success('Simulation completed');
        }, 1500);
        return;
      }

      const nextNodes = outgoingEdges.map(e => e.target);
      simulationRef.current = setTimeout(() => runStep(nextNodes), 1500);
    };

    runStep(currentNodes);
  }, [nodes, edges, isSimulating, setNodes, setEdges, stopSimulation]);

  useEffect(() => {
    return () => {
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      let data = {};
      if (type === 'action') {
        data = { label: 'Generate PO', description: 'Automatically generate Purchase Order' };
      } else if (type === 'condition') {
        data = { label: 'Approval Required?', description: 'Amount > $1,000' };
      } else if (type === 'trigger') {
        data = { label: 'Scheduled Event', description: 'Runs on a schedule' };
      } else if (type === 'routing') {
        data = { label: 'Route by Category', description: 'Multi-way routing logic', routes: [{ id: 'it', label: 'IT' }, { id: 'legal', label: 'Legal' }, { id: 'default', label: 'Default' }] };
      }

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const handleSave = () => {
    toast.success('Workflow saved successfully!');
  };

  return (
    <div className="flex h-full w-full" ref={reactFlowWrapper}>
      <div className="w-64 border-r bg-background p-4 flex flex-col gap-4">
        <h3 className="font-semibold mb-2">Toolbox</h3>
        <p className="text-xs text-muted-foreground mb-4">Drag nodes to the canvas to build your workflow.</p>
        
        <div 
          className="border border-primary/50 bg-primary/10 rounded p-3 cursor-grab text-sm font-medium flex items-center gap-2 text-primary hover:bg-primary/20 transition-colors"
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow', 'trigger');
            e.dataTransfer.effectAllowed = 'move';
          }}
          draggable
        >
          <Play className="h-4 w-4" /> Trigger
        </div>
        
        <div 
          className="border border-blue-500/50 bg-blue-500/10 rounded p-3 cursor-grab text-sm font-medium flex items-center gap-2 text-blue-600 hover:bg-blue-500/20 transition-colors"
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow', 'action');
            e.dataTransfer.effectAllowed = 'move';
          }}
          draggable
        >
          <FileText className="h-4 w-4" /> Action (e.g., PO)
        </div>
        
        <div 
          className="border border-amber-500/50 bg-amber-500/10 rounded p-3 cursor-grab text-sm font-medium flex items-center gap-2 text-amber-600 hover:bg-amber-500/20 transition-colors"
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow', 'condition');
            e.dataTransfer.effectAllowed = 'move';
          }}
          draggable
        >
          <GitFork className="h-4 w-4" /> Condition (Approval)
        </div>

        <div 
          className="border border-purple-500/50 bg-purple-500/10 rounded p-3 cursor-grab text-sm font-medium flex items-center gap-2 text-purple-600 hover:bg-purple-500/20 transition-colors"
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow', 'routing');
            e.dataTransfer.effectAllowed = 'move';
          }}
          draggable
        >
          <Waypoints className="h-4 w-4" /> Routing (Multi-way)
        </div>
      </div>
      
      <div className="flex-1 relative bg-muted/30">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-right" className="p-4 flex gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onChange={(e) => {
                const template = e.target.value;
                if (template === 'standard') {
                  setNodes(templates.standard.nodes as Node[]);
                  setEdges(templates.standard.edges as Edge[]);
                } else if (template === 'capex') {
                  setNodes(templates.capex.nodes as Node[]);
                  setEdges(templates.capex.edges as Edge[]);
                } else if (template === 'blank') {
                  setNodes([]);
                  setEdges([]);
                }
                e.target.value = '';
              }}
            >
              <option value="">Load Template...</option>
              <option value="standard">Standard Purchase</option>
              <option value="capex">Capital Expenditure Approval</option>
              <option value="blank">Blank Canvas</option>
            </select>
            <Button onClick={startSimulation} variant={isSimulating ? "secondary" : "outline"} className="gap-2">
              {isSimulating ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />} 
              {isSimulating ? 'Stop Preview' : 'Preview Mode'}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Workflow
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      <div className="w-80 border-l bg-background p-4 flex flex-col gap-4 overflow-y-auto">
        <h3 className="font-semibold mb-2">Properties</h3>
        {nodes.find((n) => n.selected) ? (
          <div className="flex flex-col gap-4">
            {(() => {
              const selectedNode = nodes.find((n) => n.selected)!;
              
              const updateData = (field: string, value: string) => {
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === selectedNode.id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          [field]: value,
                        },
                      };
                    }
                    return node;
                  })
                );
              };

              return (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Label</label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={(selectedNode.data.label as string) || ''}
                      onChange={(e) => updateData('label', e.target.value)}
                      placeholder="Node Label"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={(selectedNode.data.description as string) || ''}
                      onChange={(e) => updateData('description', e.target.value)}
                      placeholder="Node Description"
                    />
                  </div>

                  {selectedNode.type === 'condition' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Threshold Amount ($)</label>
                      <input
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={(selectedNode.data.threshold as string) || ''}
                        onChange={(e) => updateData('threshold', e.target.value)}
                        placeholder="e.g. 1000"
                      />
                    </div>
                  )}

                  {selectedNode.type === 'action' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Assigned Role / Manager</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={(selectedNode.data.role as string) || ''}
                        onChange={(e) => updateData('role', e.target.value)}
                      >
                        <option value="">Select a role...</option>
                        <option value="procurement_manager">Procurement Manager</option>
                        <option value="finance_director">Finance Director</option>
                        <option value="department_head">Department Head</option>
                        <option value="legal_team">Legal Team</option>
                      </select>
                    </div>
                  )}
                  
                  {selectedNode.type === 'trigger' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Event Type</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={(selectedNode.data.eventType as string) || ''}
                        onChange={(e) => updateData('eventType', e.target.value)}
                      >
                        <option value="">Select event...</option>
                        <option value="on_submit">On Request Submit</option>
                        <option value="on_approve">On Request Approve</option>
                        <option value="scheduled">Scheduled (Daily/Weekly)</option>
                      </select>
                    </div>
                  )}

                  {selectedNode.type === 'routing' && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Routing Paths</label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs px-2"
                          onClick={() => {
                            const routes = (selectedNode.data.routes as any[]) || [];
                            const newRoutes = [...routes, { id: `route-${Date.now()}`, label: `Route ${routes.length + 1}` }];
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, routes: newRoutes } } : n));
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Route
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {((selectedNode.data.routes as any[]) || []).map((route: any, idx: number) => (
                          <div key={route.id} className="flex items-center gap-2">
                            <input
                              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={route.label}
                              onChange={(e) => {
                                const newRoutes = [...((selectedNode.data.routes as any[]) || [])];
                                newRoutes[idx].label = e.target.value;
                                setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, routes: newRoutes } } : n));
                              }}
                              placeholder="Route Label"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                const routes = (selectedNode.data.routes as any[]) || [];
                                const newRoutes = routes.filter((_: any, i: number) => i !== idx);
                                setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, routes: newRoutes } } : n));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed rounded-lg">
            Select a node on the canvas to view and edit its properties.
          </div>
        )}
      </div>
    </div>
  );
};

export function WorkflowDesigner() {
  const [workflowMeta, setWorkflowMeta, clearAutoSave] = useFormAutoSave('workflow-designer-meta', {
    name: 'Untitled Workflow',
    description: ''
  });

  return (
    <div className="h-full w-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Workflow Designer</h1>
        </div>
        <Button variant="outline" onClick={clearAutoSave} className="text-muted-foreground">
          Clear Auto-Save Form
        </Button>
      </div>
      <p className="text-muted-foreground">
        Automate your procurement processes by designing custom approval hierarchies and PO generation workflows.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Workflow Name</label>
          <input
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={workflowMeta.name}
            onChange={(e) => setWorkflowMeta({ ...workflowMeta, name: e.target.value })}
            placeholder="e.g. IT Hardware Approval"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <input
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={workflowMeta.description}
            onChange={(e) => setWorkflowMeta({ ...workflowMeta, description: e.target.value })}
            placeholder="Brief description of this workflow"
          />
        </div>
      </div>
      
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow overflow-hidden h-[600px] min-h-[600px] mt-2">
        <ReactFlowProvider>
          <Designer />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
