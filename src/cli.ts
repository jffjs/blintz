import minimist, { ParsedArgs } from 'minimist';
import { Blintz } from './lib/blintz';

const blintz = new Blintz();

const args: ParsedArgs = minimist(process.argv);
console.log(args);

if (args.f) {
  blintz.runFile(args.f);
} else {
  blintz.runPrompt();
}
