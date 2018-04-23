import { FunctionStmt } from './ast/stmt';
import { Callable } from './callable';
import Environment from './environment';
import Interpreter from './interpreter';
import BlintzObject from './object';
import { Value } from './value';

export default class BlintzFunction implements Callable {

  constructor(
    private readonly declaration: FunctionStmt,
    private readonly closure: Environment,
    private readonly isInitializer: boolean = false
  ) { }

  public arity(): number {
    return this.declaration.parameters.length;
  }

  public bind(object: BlintzObject): BlintzFunction {
    const environment = new Environment(this.closure);
    environment.define('this', object);
    return new BlintzFunction(this.declaration, environment, this.isInitializer);
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

    if (this.isInitializer) {
      return this.closure.getAt(0, 'this');
    }
    return null;
  }

  public toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
