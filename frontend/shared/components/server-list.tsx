"use client";
import React from "react";
import { mcpApi } from "../services/api";
import { McpServer } from "@/@types/mcp";
import { Cpu, Server } from "lucide-react";

interface Props {
  className?: string;
}

export const ServerList: React.FC<Props> = ({ className }) => {
  const [servers, setServers] = React.useState<McpServer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadServers = async () => {
    try {
      setLoading(true);
      const serverList = await mcpApi.getServers();
      setServers(serverList);
      setError(null);
    } catch (err) {
      setError("Failed to load servers");
      console.error("Error loading servers:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadServers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadServers}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Server className="h-5 w-5 mr-2" />
          MCP Servers
        </h2>
      </div>
      <div className="divide-y">
        {servers.map((server) => (
          <div
            key={server.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Cpu
                    className={`h-5 w-5 ${
                      server.isActive ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {server.name}
                    </h3>
                    <p className="text-sm text-gray-900">
                      {server.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{server.url}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    server.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {server.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
