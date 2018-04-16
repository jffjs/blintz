import RuntimeError from './runtime-error';
import { Token } from './token';
import { Value } from './value';

export default class Environment {
  private readonly values: Map<string, Value> = new Map<string, Value>();

  constructor(private enclosing: Environment | null = null) { }

  public define(name: string, value: Value) {
    this.values.set(name, value);
  }

  public get(name: Token): Value {
    const value = this.values.get(name.lexeme);

    if (value !== undefined) {
      return value;
    } else {
      if (this.enclosing) {
        return this.enclosing.get(name);
      }
      throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
  }

  public assign(name: Token, value: Value) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
