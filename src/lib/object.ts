import BlintzClass from './class';
import RuntimeError from './runtime-error';
import { Token } from './token';
import { Value } from './value';

export default class BlintzObject {

  private readonly fields = new Map<string, Value>();

  constructor(private readonly klass: BlintzClass) { }

  public get(name: Token): Value {
    const value = this.fields.get(name.lexeme);
    if (value !== undefined) {
      return value;
    }

    const method = this.klass.findMethod(this, name.lexeme);
    if (method !== null) {
      return method;
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  public set(name: Token, value: Value) {
    this.fields.set(name.lexeme, value);
  }

  public toString(): string {
    return `${this.klass} object`;
  }
}
