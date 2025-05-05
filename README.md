# MCP Toolbox

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tollbit/mcp-streamable-http-shim)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ZB4mEKDRm4)

This package provides a stdio MCP server that integrates with any streamable http backend.
It is intended to be used as a temporary patch while the official @modelcontextprotocol/inspector gets support for streamable http.

To run the server, use the command:

```
npx @tollbit/mcp-streamable-http-shim --url https://your-url-here.com
```

If you want to add headers to requests to your server (maybe you use an API key), you can use a cURL style parameter `-H`:

```
npx @tollbit/mcp-streamable-http-shim --url https://your-url-here.com -H "some-header: and-its-value" -H "Authorization: Bearer $MY_TOKEN"
```

The full command for the modelcontextprotocol/inspector is:
```
npx @modelcontextprotocol/inspector npx -y @tollbit/mcp-streamable-http-shim --url \"https://example.com/mcp\"
```
You may need to re-add quotes in the MCP editor

