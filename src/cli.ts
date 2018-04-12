import { Blintz } from './lib/blintz';
import { printLn } from './lib/print';

const blintz = new Blintz();

const args = process.argv.splice(2);

if (args.length > 1) {
  printLn('Usage: blintz [script]');
} else if (args.length === 1) {
  blintz.runFile(args[0]);
} else {
  blintz.repl();
}
