export interface McpServer {
  id: string;
  name: string;
  url: string;
  description: string;
  isActive: boolean;
}

export interface McpTool {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolCreate {
  toolName: string;
  mcpServerId: string;
  parameters: Record<string, any>;
}

export interface ToolResponse {
  success: boolean;
  result?: any;
  error?: string;
  timeStamp: Date;
  duration: number;
}

export interface ActivityLog {
  id: string;
  toolName: string;
  serverName: string;
  success: boolean;
  timeStamp: Date;
  duration: number;
  error?: string;
}
