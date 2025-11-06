import { Injectable, Logger } from '@nestjs/common';
import { McpTool } from 'src/common/interfaces/mcp-tool.interface';

const serversData = require('../../../mock-mcp/mcp-servers.json');
const toolsData = require('../../../mock-mcp/mcp-tools.json');

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async getTools(serverUrl: string): Promise<McpTool[]> {
    try {
      this.logger.log(`Getting tools for server: ${serverUrl}`);

      const server = serversData.find((s) => s.url === serverUrl);
      if (!server) {
        this.logger.warn(`Server not found: ${serverUrl}`);
        return this.getDefaultMockTools();
      }

      const serverTools = toolsData[server.id] as McpTool[] | undefined;
      if (!serverTools) {
        this.logger.warn(`Tools not found for server: ${server.id}`);
        return this.getDefaultMockTools();
      }

      return serverTools;
    } catch (error) {
      this.logger.error(
        `Failed to get tools for ${serverUrl}: ${error.message}`,
      );
      return this.getDefaultMockTools();
    }
  }

  async callTool(
    serverUrl: string,
    toolName: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    try {
      this.logger.log(`Calling tool ${toolName} on ${serverUrl}`);

      await new Promise((resolve) => setTimeout(resolve, 200));

      return this.mockToolCall(toolName, parameters);
    } catch (error) {
      this.logger.error(`Tool call failed: ${error.message}`);
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  private getDefaultMockTools(): McpTool[] {
    return [
      {
        name: 'default_tool',
        description: 'Default mock tool',
        parameters: [
          {
            name: 'input',
            type: 'string',
            description: 'Input parameter',
            required: true,
          },
        ],
      },
    ];
  }

  private mockToolCall(toolName: string, parameters: Record<string, any>) {
    let text: string;
    let words: string[];
    let wordCount: number;
    let sentiment: string;
    const { operation, a, b } = parameters;
    let result: number;

    switch (toolName) {
      case 'text_analyzer':
        text = parameters.text || '';
        words = text.split(/\s+/).filter((word) => word.length > 0);
        wordCount = words.length;
        sentiment =
          wordCount > 10 ? 'positive' : wordCount > 5 ? 'neutral' : 'negative';

        return {
          wordCount,
          sentiment,
          characters: text.length,
          words: words,
        };

      case 'calculator':
        switch (operation) {
          case 'add':
            result = a + b;
            break;
          case 'subtract':
            result = a - b;
            break;
          case 'multiply':
            result = a * b;
            break;
          case 'divide':
            if (b === 0) throw new Error('Division by zero');
            result = a / b;
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        return {
          operation: `${a} ${operation} ${b}`,
          result,
          timeStamp: new Date().toISOString(),
        };

      default:
        return {
          tool: toolName,
          parameters: parameters,
          message: 'Mock execution completed successfully',
          timeStamp: new Date().toISOString(),
          mock: true,
        };
    }
  }
}
