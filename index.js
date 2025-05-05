#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import commandLineArgs from "command-line-args";

const optionDefinitions = [
  { name: "url", alias: "u", type: String },
  { name: "header", alias: "H", type: String, multiple: true },
];
const options = commandLineArgs(optionDefinitions);

const host = options.url;
if (!host) {
  console.error("No host provided. Exiting.");
  process.exit(1);
}

const headers = options.header || [];
const headerMap = {};
for (const header of headers) {
  const [key, value] = header.split(":");
  if (key && value) {
    headerMap[key.trim()] = value.trim();
  }
}

console.error("Starting stdio bridge, connecting to [%s]...", host, headerMap);

const server = new Server(
  {
    name: "streamable-http-shim-stdio-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        listChanged: true,
      },
    },
  }
);

// Cache for tools
var serverClient, serverTransport;
async function connectToServer() {
  serverClient = new Client({
    name: "streamable-http-shim",
    version: "1.0.0",
  });
  serverTransport = new StreamableHTTPClientTransport(new URL(host), {
    requestInit: {
      headers: {
        ...headerMap,
      },
    },
  });
  await serverClient.connect(serverTransport);
}

// Set up MCP server handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    console.error("Handling tools/list request");
    try {
      const listToolsResponse = await serverClient.listTools();

      const generateClaudeSafeName = (name) => {
        return name.replace(/[^a-zA-Z0-9_]/g, "_");
      };

      return { tools: listToolsResponse.tools };
    } catch (error) {
      console.error("error", error);
      return { tools: [] };
    }
  } catch (e) {
    console.error("error in list tools call", e);
  }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    console.error(
      `Forwarding tool call: ${name} (${toolNameMapping[name]})`,
      args
    );

    const result = await serverClient.callTool({
      name,
      arguments: args,
    });

    if (result.isError) {
      console.error("Error executing tool:", result.error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool: ${result.error.message}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: result.content,
    };
  } catch (error) {
    console.error(`Tool call failed:`, error.message);
    return {
      content: [
        {
          type: "text",
          text: `Error connecting to dynamic server: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function start() {
  await connectToServer();
  try {
    console.error("Starting server initialization...");
    console.error("Process ID:", process.pid);
    console.error("Parent process ID:", process.ppid);

    // Start the stdio server
    console.error("Starting stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Local MCP bridge running");

    // Keep the process alive
    process.stdin.resume();

    // Add keep-alive mechanism
    const keepAliveInterval = setInterval(() => {
      console.error("Keep-alive ping");
    }, 10000); // Ping every 10 seconds

    // Handle process termination
    process.on("SIGINT", () => {
      console.error("Received SIGINT, shutting down gracefully...");
      clearInterval(keepAliveInterval);
      process.exit(0);
    });

    process.on("SIGTERM", (signal) => {
      console.error("Received SIGTERM signal:", signal);
      clearInterval(keepAliveInterval);
      process.exit(0);
    });

    // Log any unhandled errors
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
      console.error("Error stack:", error.stack);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled rejection at:", promise);
      console.error("Reason:", reason);
    });

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    console.error("Failed to start server:", error.message);
    console.error("Error stack:", error.stack);
    process.exit(1);
  }
}

// Run the server
console.error("Starting server...");
start();
