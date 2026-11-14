import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const portArgument = process.argv.find((argument) => argument.startsWith("--port="));
const port = Number(portArgument?.slice(7) ?? 4173);
const lan = process.argv.includes("--lan");
const host = lan ? "0.0.0.0" : "127.0.0.1";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return;

  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start <= end && start < size) return { start, end };
}

const server = createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const requested = pathname === "/" ? "/index.html" : pathname;
    const allowed = /^(?:\/index\.html|\/(?:assets|styles|scripts)\/[\w./-]+)$/.test(requested);
    const file = resolve(root, "." + requested);
    const contentType = types[extname(file)];
    if (!allowed || !file.startsWith(resolve(root) + sep) || !contentType) {
      response.writeHead(404).end();
      return;
    }

    const { size, isFile } = await stat(file).then((info) => ({ size: info.size, isFile: info.isFile() }));
    if (!isFile) {
      response.writeHead(404).end();
      return;
    }

    const headers = { "Content-Type": contentType, "Accept-Ranges": "bytes" };
    const range = request.headers.range && parseRange(request.headers.range, size);
    if (request.headers.range && !range) {
      response.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
      return;
    }

    if (range) {
      headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
      headers["Content-Length"] = range.end - range.start + 1;
    } else {
      headers["Content-Length"] = size;
    }
    response.writeHead(range ? 206 : 200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    const stream = createReadStream(file, range || undefined);
    response.on("close", () => stream.destroy());
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end();
  }
});

server.listen(port, host, () => {
  console.log(`Local preview  http://localhost:${port}`);
  if (!lan) return;

  for (const address of Object.values(networkInterfaces()).flat()) {
    if (address.family === "IPv4" && !address.internal) {
      console.log(`Network preview  http://${address.address}:${port}`);
    }
  }
});
