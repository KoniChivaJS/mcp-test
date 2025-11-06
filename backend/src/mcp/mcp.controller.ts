import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { McpServer } from 'src/common/interfaces/mcp-server.interface';
import { McpService } from './mcp.service';
import { McpTool } from 'src/common/interfaces/mcp-tool.interface';
import { ToolResponseDto } from 'src/common/dto/tool-response.dto';
import { ToolCreateDto } from 'src/common/dto/tool-create.dto';

@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);
  private readonly mockServers: McpServer[] = [
    {
      id: 'mock-server-1',
      name: 'Analytics MCP Server',
      url: 'http://localhost:3003/mcp',
      description: 'Server for text analysis and data processing tools',
      isActive: true,
    },
    {
      id: 'mock-server-2',
      name: 'Calculator MCP Server',
      url: 'http://localhost:3004/mcp',
      description: 'Server for mathematical operations',
      isActive: true,
    },
  ];

  constructor(private readonly mcpClientService: McpService) {}

  @Get('servers')
  getServers(): McpServer[] {
    this.logger.log('Fetching available MCP servers');
    return this.mockServers;
  }

  @Get('servers/:serverId/tools')
  async getServerTools(
    @Param('serverId') serverId: string,
  ): Promise<McpTool[]> {
    this.logger.log(`Fetching tools for server: ${serverId}`);

    const server = this.mockServers.find((s) => s.id === serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    return Promise.resolve(this.mcpClientService.getTools(server.url));
  }

  @Post('tools/call')
  async callTool(@Body() body: any): Promise<ToolResponseDto> {
    const startTime = Date.now();

    try {
      const { toolName, mcpServerId, parameters } = body;

      this.logger.log(`Calling tool: ${toolName}`);

      if (!mcpServerId) {
        throw new Error('mcpServerId is required but was not provided');
      }

      const server = this.mockServers.find((s) => s.id === mcpServerId);

      if (!server) {
        throw new Error(
          `Server not found: ${mcpServerId}. Available servers: ${this.mockServers.map((s) => s.id).join(', ')}`,
        );
      }

      const result = await this.mcpClientService.callTool(
        server.url,
        toolName,
        parameters || {},
      );

      const response: ToolResponseDto = {
        success: true,
        result,
        timeStamp: new Date(),
        duration: Date.now() - startTime,
      };

      this.logger.log(
        `Tool call completed successfully in ${response.duration}ms`,
      );
      return response;
    } catch (error) {
      const response: ToolResponseDto = {
        success: false,
        error: error.message,
        timeStamp: new Date(),
        duration: Date.now() - startTime,
      };

      this.logger.error(`Tool call failed: ${error.message}`);
      return response;
    }
  }

  @Get('tools')
  async getAllTools(): Promise<{ server: McpServer; tools: McpTool[] }[]> {
    this.logger.log('Fetching all tools from all servers');

    const results: { server: McpServer; tools: McpTool[]; error?: string }[] =
      [];

    for (const server of this.mockServers) {
      try {
        const tools = await this.mcpClientService.getTools(server.url);
        results.push({ server, tools });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch tools from server ${server.name}: ${error.message}`,
        );
        results.push({ server, tools: [], error: error.message });
      }
    }

    return results;
  }
}
