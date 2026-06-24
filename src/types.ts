export interface LogData {
  id: string;
  client: string;
  hours: number;
  rate: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'evaluated' | 'invoiced';
}

export interface ClientProfile {
  id: string;
  name: string;
  industry: string;
  defaultRate: number;
  monthlyCap: number;
  currency: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'rule' | 'multiplier' | 'action' | 'destination';
  title: string;
  subtitle: string;
  x: number;
  y: number;
  z: number; // For 3D layout simulation
  status: 'idle' | 'active' | 'success' | 'alert';
  config: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  fromId: string;
  toId: string;
  animated: boolean;
  colorType: 'primary' | 'apricot' | 'success' | 'muted';
}

export interface InvoicingRule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  type: 'threshold' | 'multiplier' | 'auto_email' | 'tax_addon';
  value: number;
}
