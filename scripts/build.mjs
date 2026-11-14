import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);

await rm(output, { recursive: true, force: true });
await mkdir(output);

for (const file of ["index.html", "assets", "styles", "scripts"]) {
  await cp(new URL(file, root), new URL(file, output), {
    recursive: true,
    filter: (source) => !source.endsWith(".mjs"),
  });
}
