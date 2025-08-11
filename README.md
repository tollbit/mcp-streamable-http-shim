## MCP Streamable HTTP Shim

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tollbit/mcp-streamable-http-shim)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ZB4mEKDRm4)

A stdio MCP server that proxies to any streamable HTTP MCP backend. Use it as a temporary bridge until `@modelcontextprotocol/inspector` natively supports streamable HTTP.

## Why Use This?
- **Bridge stdio-only clients to HTTP servers**: Run MCP clients that only speak stdio against a remote streamable HTTP MCP server.
- **Zero changes to your server**: Point the shim at your existing HTTP endpoint and go.
- **Simple auth via headers**: Pass API keys and custom headers with familiar cURL-style `-H` flags.

## Installation
- **Run with npx**: `npx @tollbit/mcp-streamable-http-shim`
- Or install globally: `npm i -g @tollbit/mcp-streamable-http-shim`

## Quick Start
Use the shim to connect a stdio-based client (like the Inspector) to your HTTP MCP server.

### Inspector
```bash
npx @modelcontextprotocol/inspector npx -y @tollbit/mcp-streamable-http-shim --url "https://example.com/mcp"
```

### Add Headers (API keys, etc.)
Repeat `-H` to send multiple headers:
```bash
npx @tollbit/mcp-streamable-http-shim --url https://your-url-here.com \
  -H "some-header: and-its-value" \
  -H "Authorization: Bearer $MY_TOKEN"
```

## Key Features
- **End-to-end streaming** using the MCP SDK `StreamableHTTPClientTransport`.
- **Tool passthrough**: `tools/list` and `tools/call` proxied to the remote server.
- **Stdio transport**: Works with any client that connects over stdio.

## Documentation
- **Full Documentation**: This README
- **API Reference**: See `@modelcontextprotocol/sdk` types and transports
- **Examples**: See Quick Start and MCP Configuration below

## Common Use Cases
- **Use stdio-only MCP clients with your HTTP server**: Point the shim at your remote MCP service and use it from Inspector or similar tools.
- **Add auth to requests**: Pass `-H "Authorization: Bearer <token>"` for secured endpoints.
- **Local testing of remote servers**: Verify tool listing and tool invocation quickly without changing your server.

## Requirements
- **Node.js**: v18 or newer
- **Network access** to your HTTP MCP server implementing streamable HTTP

## Support
- **Community**: [Join Discord](https://discord.gg/ZB4mEKDRm4)
- **Issues**: Use [GitHub Issues](https://github.com/tollbit/mcp-streamable-http-shim/issues)
- **Discussions**: See [GitHub Discussions](https://github.com/tollbit/mcp-streamable-http-shim/discussions)

## License
MIT

## How This Fits in the Tollbit Toolbox
This shim makes any streamable HTTP MCP server usable from stdio-only clients. It’s a lightweight bridge that preserves streaming semantics while you use tools like the Inspector or other stdio-based environments.

## MCP Configuration
Below are examples for common MCP clients.

### Claude Desktop (JSON config)
Add an entry under `mcpServers`:
```json
{
  "mcpServers": {
    "http-shim": {
      "command": "npx",
      "args": [
        "-y",
        "@tollbit/mcp-streamable-http-shim",
        "--url",
        "https://example.com/mcp",
        "-H",
        "Authorization: Bearer ${MY_TOKEN}"
      ]
    }
  }
}
```

### Inspector (CLI)
```bash
npx @modelcontextprotocol/inspector npx -y @tollbit/mcp-streamable-http-shim --url "https://example.com/mcp"
```

## Authentication
Pass headers using repeated `-H` flags. Values can come from environment variables.
```bash
export MY_TOKEN=sk-... 
npx @tollbit/mcp-streamable-http-shim --url https://example.com/mcp \
  -H "Authorization: Bearer $MY_TOKEN" \
  -H "X-Org: my-org"
```

## Error Handling
- **No host provided**: The shim exits with an error. Provide `--url <https://...>`.
- **401/403 from server**: Check your `-H` headers and tokens.
- **Tool call errors**: Remote errors are surfaced back to the client as MCP tool errors.
- **Connectivity issues**: The shim logs to stderr and will report connection errors to the client.

## Advanced Usage
- **Multiple headers**: Repeat `-H` for each header; format as `Key: Value`.
- **Verbose logs**: Operational logs are written to stderr; the process sends keep-alive pings every 10s.
- **Signals**: Gracefully handles `SIGINT`/`SIGTERM`.
- **Compatibility**: Works with stdio-based clients while preserving streamable HTTP semantics via the MCP SDK.
