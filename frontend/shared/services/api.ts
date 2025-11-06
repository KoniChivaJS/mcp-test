import { McpServer, McpTool, ToolCreate, ToolResponse } from "@/@types/mcp";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/mcp";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const mcpApi = {
  getServers: async (): Promise<McpServer[]> => {
    const response = await api.get("/servers");
    return response.data;
  },

  getServerTools: async (serverId: string): Promise<McpTool[]> => {
    const response = await api.get(`/servers/${serverId}/tools`);
    return response.data;
  },

  getAllTools: async (): Promise<{ server: McpServer; tools: McpTool[] }[]> => {
    const response = await api.get("/tools");
    return response.data;
  },

  callTool: async (toolCall: ToolCreate): Promise<ToolResponse> => {
    const response = await api.post("/tools/call", toolCall);
    return response.data;
  },
};
