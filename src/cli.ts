import { Blintz } from './lib/blintz';

const blintz = new Blintz();

const args = process.argv.splice(2);

if (args.length > 1) {
  console.info("Usage: blintz [script]");
} else if (args.length === 1) {
  blintz.runFile(args[0]);
} else {
  blintz.runPrompt();
}
