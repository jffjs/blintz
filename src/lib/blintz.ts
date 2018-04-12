import { readFileSync } from 'fs';
import { createInterface, ReadLine } from 'readline';
import { printErr, printLn } from './print';
import { Scanner } from './scanner';
import { Token } from './token';

export class Blintz {
  public static hadError: boolean = false;

  public static error(line: number, msg: string) {
    Blintz.report(line, '', msg);
  }

  private static report(line: number, where: string, msg: string) {
    printErr(`[line ${line}] Error${where}: ${msg}`);
    Blintz.hadError = true;
  }

  private rl: ReadLine = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  public runFile(filename: string) {
    const file: string = readFileSync(filename, 'utf8');
    this.run(file);

    if (Blintz.hadError) {
      process.exit(65);
    } else {
      process.exit(0);
    }
  }

  public repl() {
    this.rl.setPrompt('> ');

    this.rl.prompt();

    this.rl.on('line', (line: string) => {
      this.processReplInput(line.trim());

      this.rl.prompt();
    }).on('close', () => {
      printLn('exiting...');
      process.exit(0);
    });
  }

  private processReplInput(line: string) {
    switch(line) {
      case 'exit':
      case 'quit':
        this.rl.close();
        break;
      default:
        this.run(line);
        Blintz.hadError = false;
    }
  }

  private run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    tokens.forEach((token: Token) => {
      printLn(token.toString());
    });
  }
}
