import { createInterface, ReadLine } from 'readline';
import { printLn } from './print';

export class Blintz {

  private rl: ReadLine = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  public runFile(filename: string) {
    printLn(`running script ${filename}`);
    process.exit(0);
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
        printLn(line);
    }
  }
}
