"use client";
import { ActivityLog, McpServer, McpTool, ToolResponse } from "@/@types/mcp";
import React from "react";
import { mcpApi } from "../services/api";
import { CheckCircle, Clock, Play, XCircle } from "lucide-react";

interface Props {
  className?: string;
}

export const ToolExplorer: React.FC<Props> = ({ className }) => {
  const [toolsData, setToolsData] = React.useState<
    { server: McpServer; tools: McpTool[] }[]
  >([]);
  const [selectedTool, setSelectedTool] = React.useState<{
    server: McpServer;
    tool: McpTool;
  } | null>(null);
  const [parameters, setParameters] = React.useState<Record<string, any>>({});
  const [result, setResult] = React.useState<ToolResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activityLog, setActivityLog] = React.useState<ActivityLog[]>([]);

  React.useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await mcpApi.getAllTools();
      setToolsData(data);
    } catch (error) {
      console.error("Error loading tools:", error);
    }
  };

  const handleToolSelect = (server: McpServer, tool: McpTool) => {
    setSelectedTool({ server, tool });
    setParameters({});
    setResult(null);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    try {
      const response = await mcpApi.callTool({
        toolName: selectedTool.tool.name,
        mcpServerId: selectedTool.server.id,
        parameters,
      });

      setResult(response);

      const logEntry: ActivityLog = {
        id: Date.now().toString(),
        toolName: selectedTool.tool.name,
        serverName: selectedTool.server.name,
        success: response.success,
        timeStamp: new Date(),
        duration: response.duration,
        error: response.error,
      };

      setActivityLog((prev) => [logEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Error executing tool:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timeStamp: new Date(),
        duration: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name] || "";

    switch (param.type) {
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handleParameterChange(param.name, parseFloat(e.target.value) || 0)
            }
            className="mt-1 text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter ${param.name}`}
          />
        );
      case "boolean":
        return (
          <select
            value={value}
            onChange={(e) =>
              handleParameterChange(param.name, e.target.value === "true")
            }
            className="mt-1 text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="mt-1 text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter ${param.name}`}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Tools
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {toolsData.map(({ server, tools }) => (
              <div key={server.id} className="border-b">
                <div className="px-6 py-3 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900">
                    {server.name}
                  </h3>
                  <p className="text-xs text-gray-900">{server.description}</p>
                </div>
                {tools.map((tool) => (
                  <div
                    key={`${server.id}-${tool.name}`}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTool?.tool.name === tool.name &&
                      selectedTool?.server.id === server.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => handleToolSelect(server, tool)}
                  >
                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tool.parameters.map((param) => (
                        <span
                          key={param.name}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {param.name}: {param.type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectedTool && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Execute: {selectedTool.tool.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Server: {selectedTool.server.name}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {selectedTool.tool.parameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {param.name}
                    {param.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <p className="text-xs text-gray-900 mb-1">
                    {param.description}
                  </p>
                  {renderParameterInput(param)}
                </div>
              ))}

              <button
                onClick={executeTool}
                disabled={
                  loading ||
                  selectedTool.tool.parameters.some(
                    (param) => param.required && !parameters[param.name]
                  )
                }
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Tool
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                Execution Result
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-900 mt-1">
                <span>Duration: {result.duration}ms</span>
                <span>
                  Time: {new Date(result.timeStamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="p-6">
              {result.success ? (
                <pre className="bg-gray-50 text-gray-900 p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              ) : (
                <div className="text-red-600 bg-red-50 p-4 rounded-md">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          </div>
        )}

        {activityLog.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y">
              {activityLog.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {log.toolName}
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        on {log.serverName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          log.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.success ? "Success" : "Failed"}
                      </span>
                      <span className="text-xs text-gray-900">
                        {log.duration}ms
                      </span>
                      <span className="text-xs text-gray-900">
                        {new Date(log.timeStamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {log.error && (
                    <p className="text-sm text-red-600 mt-1">{log.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
