#!/usr/bin/env node

import { Blintz } from '..';

const args = process.argv;
const blintz = new Blintz();

console.log(args);

if (args.length > 1) {
  console.info("Usage: blintz [script]");
} else if (args.length === 1) {
  blintz.runFile(args[0]);
} else {
  blintz.runPrompt();
}
