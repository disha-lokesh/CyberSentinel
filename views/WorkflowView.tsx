import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Shield, Database, Server } from 'lucide-react';

interface Node {
  id: string;
  type: 'red' | 'blue' | 'data';
  label: string;
  x: number;
  y: number;
  status: 'idle' | 'active' | 'success' | 'error';
}

interface Connection {
  from: string;
  to: string;
  active: boolean;
}

interface LogEntry {
  id: string;
  nodeId: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'error';
}

export const WorkflowView: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'data-1', type: 'data', label: 'Target System', x: 100, y: 200, status: 'idle' },
    { id: 'red-1', type: 'red', label: 'Recon Agent', x: 300, y: 100, status: 'idle' },
    { id: 'red-2', type: 'red', label: 'Exploit Agent', x: 300, y: 300, status: 'idle' },
    { id: 'blue-1', type: 'blue', label: 'Detection Agent', x: 550, y: 100, status: 'idle' },
    { id: 'blue-2', type: 'blue', label: 'Response Agent', x: 550, y: 300, status: 'idle' },
    { id: 'data-2', type: 'data', label: 'Security Logs', x: 800, y: 200, status: 'idle' },
  ]);

  const [connections] = useState<Connection[]>([
    { from: 'data-1', to: 'red-1', active: false },
    { from: 'data-1', to: 'red-2', active: false },
    { from: 'red-1', to: 'blue-1', active: false },
    { from: 'red-2', to: 'blue-2', active: false },
    { from: 'blue-1', to: 'data-2', active: false },
    { from: 'blue-2', to: 'data-2', active: false },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addLog = (nodeId: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now().toString(),
      nodeId,
      message,
      timestamp: Date.now(),
      type
    }].slice(-20));
  };

  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    const sequence = [
      { id: 'red-1', message: 'Scanning target system...', delay: 1000 },
      { id: 'red-1', message: 'Ports 80, 443, 22 discovered', delay: 1500 },
      { id: 'blue-1', message: 'Suspicious scan detected', delay: 500 },
      { id: 'red-2', message: 'Attempting SQL injection...', delay: 1000 },
      { id: 'blue-2', message: 'Malicious payload blocked', delay: 800 },
      { id: 'blue-2', message: 'Firewall rules updated', delay: 500 },
      { id: 'data-2', message: 'Incident logged', delay: 500 },
    ];

    for (const step of sequence) {
      if (!isRunning) break;
      
      setNodes(prev => prev.map(n => 
        n.id === step.id ? { ...n, status: 'active' } : n
      ));

      addLog(step.id, step.message, 'info');
      
      await new Promise(resolve => setTimeout(resolve, step.delay));
      
      setNodes(prev => prev.map(n => 
        n.id === step.id ? { ...n, status: 'success' } : n
      ));
    }

    addLog('data-2', 'Workflow completed successfully', 'success');
    setIsRunning(false);
  };

  const resetWorkflow = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setLogs([]);
    setIsRunning(false);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(prev => prev.map(n =>
      n.id === draggedNode ? { ...n, x: Math.max(0, Math.min(x, 900)), y: Math.max(0, Math.min(y, 500)) } : n
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeColor = (node: Node) => {
    if (node.status === 'active') return node.type === 'red' ? 'bg-red-600' : node.type === 'blue' ? 'bg-blue-600' : 'bg-purple-600';
    if (node.status === 'success') return node.type === 'red' ? 'bg-red-500/50' : node.type === 'blue' ? 'bg-blue-500/50' : 'bg-purple-500/50';
    if (node.status === 'error') return 'bg-red-900';
    return node.type === 'red' ? 'bg-red-900/30' : node.type === 'blue' ? 'bg-blue-900/30' : 'bg-slate-900/50';
  };

  const getNodeBorder = (node: Node) => {
    if (node.status === 'active') return 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]';
    if (node.status === 'success') return node.type === 'red' ? 'border-red-500' : node.type === 'blue' ? 'border-blue-500' : 'border-purple-500';
    return node.type === 'red' ? 'border-red-900/50' : node.type === 'blue' ? 'border-blue-900/50' : 'border-slate-700';
  };

  const getNodeIcon = (node: Node) => {
    if (node.type === 'red') return Zap;
    if (node.type === 'blue') return Shield;
    return node.label.includes('System') ? Server : Database;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Canvas */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
            }`}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Running...' : 'Execute'}
          </button>
          <button
            onClick={resetWorkflow}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-slate-700 hover:bg-slate-600 text-white transition-all"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Info */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-2">
          <p className="text-xs text-slate-400">💡 Drag nodes to rearrange • Click Execute to run workflow</p>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x;
              const y2 = toNode.y + 30;

              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const Icon = getNodeIcon(node);
            return (
              <div
                key={node.id}
                className={`absolute w-40 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${getNodeColor(node)} ${getNodeBorder(node)}`}
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={18} className="text-white" />
                  <span className="text-sm font-bold text-white">{node.label}</span>
                </div>
                <div className="text-xs text-slate-300 capitalize">{node.status}</div>
                {node.status === 'active' && (
                  <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 animate-pulse" style={{ width: '70%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logs Panel */}
      <div className="w-80 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-slate-400 tracking-wider">
          WORKFLOW LOGS
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {logs.length === 0 && (
            <span className="text-slate-600 italic">Waiting for workflow execution...</span>
          )}
          {logs.map(log => {
            const node = nodes.find(n => n.id === log.nodeId);
            return (
              <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {node?.label || 'System'}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-slate-300">
                  {log.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
