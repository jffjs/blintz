import { readFileSync } from 'fs';
import { createInterface, ReadLine } from 'readline';

import Interpreter from './interpreter';
import Parser from './parser';
import { printErr, printLn } from './print';
import { Scanner } from './scanner';
import { Token, TokenType } from './token';
import { Value } from './value';
import RuntimeError from './runtime-error';

export default class Blintz {

  public static hadError: boolean = false;
  public static hadRuntimeError: boolean = false;

  private readonly interpreter = new Interpreter();
  private lastValue: Value = null;

  public static error(line: number, msg: string, token?: Token) {
    if (token) {
      if (token.type === TokenType.Eof) {
        Blintz.report(line, ' at end', msg);
      } else {
        Blintz.report(line, ` at '${token.lexeme}'`, msg);
      }
    } else {
      Blintz.report(line, '', msg);
    }
  }

  public static runtimeError(err: RuntimeError) {
    printLn(err.message);
    printLn(`[line ${err.token.line}]`)
    this.hadRuntimeError = true;
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
    } else if (Blintz.hadRuntimeError) {
      process.exit(70);
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
        if (!Blintz.hadError && !Blintz.hadRuntimeError) {
          this.print(this.lastValue);
        }
        Blintz.hadError = false;
        Blintz.hadRuntimeError = false;
    }
  }

  private run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();
    const parser: Parser = new Parser(tokens);
    const expression = parser.parse();

    if (Blintz.hadError) { return; }

    if (expression) {
      try {
        this.lastValue = this.interpreter.interpret(expression);
      } catch (err) {
        Blintz.runtimeError(err);
      }
    }
  }

  private print(value: Value) {
    if (typeof value === 'string') {
      printLn(`"${value}"`);
    } else if (value !== null) {
      printLn(value.toString());
    } else {
      printLn('nil');
    }
  }
}
