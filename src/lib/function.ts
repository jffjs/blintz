import { FunctionStmt } from './ast/stmt';
import { Callable } from './callable';
import Environment from './environment';
import Interpreter from './interpreter';
import { Value } from './value';

export default class BlintzFunction implements Callable {

  constructor(private readonly declaration: FunctionStmt) { }

  public arity(): number {
    return this.declaration.parameters.length;
  }

  public call(interpreter: Interpreter, args: Value[]): Value {
    const environment = new Environment(interpreter.globals);
    args.forEach((arg: Value, i: number) => {
      environment.define(this.declaration.parameters[i].lexeme, arg);
    });

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  public toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
