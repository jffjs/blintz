import { FunctionStmt } from './ast/stmt';
import { Callable } from './callable';
import Environment from './environment';
import Interpreter from './interpreter';
import { Value } from './value';

export default class BlintzFunction implements Callable {

  constructor(
    private readonly declaration: FunctionStmt,
    private readonly closure: Environment
  ) { }

  public arity(): number {
    return this.declaration.parameters.length;
  }

  public call(interpreter: Interpreter, args: Value[]): Value {
    const environment = new Environment(this.closure);
    args.forEach((arg: Value, i: number) => {
      environment.define(this.declaration.parameters[i].lexeme, arg);
    });

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnVal) {
      return returnVal.value;
    }

    return null;
  }

  public toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
