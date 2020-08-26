#!/usr/bin/env deno run --allow-read --allow-write

import { parse } from "https://deno.land/std@0.66.0/flags/mod.ts";
import { walk } from "https://deno.land/std@0.66.0/fs/mod.ts";
import { encode } from "https://deno.land/std@0.66.0/encoding/utf8.ts";
import { yellow, cyan } from "https://deno.land/std@0.66.0/fmt/colors.ts";

import ProgressBar from "https://deno.land/x/progress@v1.1.1/mod.ts";
import shuffle from "https://deno.land/x/shuffle/mod.ts";

const args = parse(Deno.args, {
  boolean: true,
  alias: {
    force: "f",
    help: "h",
  },
});

const helpMsg = `This command could delete list half your files randomly.

USAGE:
    thanos [FLAGS]

FLAGS:
    -h, --help       Prints help information
    -f, --force      Force delete
`;

if (args.help) {
  print(helpMsg);
  Deno.exit(0);
}

print("Thanos is comming");
await printDots(4, 2000);

print(`Thanos is scanning your directory ${cyan(Deno.cwd())} `);
await printDots(6, 3000);

async function getFilesNames(): Promise<string[]> {
  const filePaths: string[] = [];
  for await (const entry of walk(".")) {
    if (entry.isFile) {
      filePaths.push(entry.path);
    }
  }
  return filePaths;
}

const files = await getFilesNames();
const deleteCount = Math.floor(files.length / 2);

console.log(`Thanos has found ${yellow(String(files.length))} files`);
await delay(300);
console.log(`Thanos will delete ${yellow(String(deleteCount))} files`);
await delay(300);

if (!args.force) {
  console.log(`Good luck! Thanos is not run with flag '${cyan("--force")}'.`);
  console.log(
    `If you really want Thanos to delete half of the files, please run '${
      cyan("thanos --force")
    }'`,
  );
  Deno.exit(0);
}

const progress = new ProgressBar({
  title: "deleting:",
  total: deleteCount,
});

const filesWillDeleted = shuffle(files).slice(0, deleteCount);

for (let i = 0; i < deleteCount; i++) {
  await Deno.remove(filesWillDeleted[i]);
  progress.render(i);
}

progress.render(deleteCount);
print("\n");

function print(str: string): void {
  Deno.stdout.writeSync(encode(str));
}

async function printDots(dots: number, ms = 1000): Promise<void> {
  for (let i = 0; i < dots; i++) {
    print(".");
    await delay(ms / dots);
  }
  print("\n");
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, ms);
  });
}
