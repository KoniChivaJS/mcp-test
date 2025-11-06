import { Header } from "@/shared/components/header";
import { ServerList } from "@/shared/components/server-list";
import { ToolExplorer } from "@/shared/components/tool-explorer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              MCP Server Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Explore and test tools from your MCP servers
            </p>
          </div>

          <ServerList />
          <ToolExplorer />
        </div>
      </main>
    </div>
  );
}
