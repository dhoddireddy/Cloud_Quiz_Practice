# Node.js Introduction

## What is Node.js?

Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine. It allows developers to run JavaScript on the server.

## Why Use Node.js?

- Fast and efficient for I/O-heavy applications
- Uses non-blocking, event-driven architecture
- Great ecosystem with npm packages

## Basic Example

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Next Steps

- Learn about Express.js
- Work with file system APIs
- Understand asynchronous patterns (callbacks, promises, async/await)
