import { Callable } from './callable';
import BlintzFunction from './function';
import Interpreter from './interpreter';
import BlintzObject from './object';
import { Value } from './value';

export default class BlintzClass implements Callable {

  constructor(
    public readonly name: string,
    public readonly superclass: BlintzClass | null,
    private readonly methods: Map<string, BlintzFunction>
  ) { }

  public arity(): number {
    const initializer = this.methods.get('init');

    if (initializer) {
      return initializer.arity();
    } else {
      return 0;
    }
  }

  public call(interpreter: Interpreter, args: Value[]): Value {
    const object = new BlintzObject(this);
    const initializer = this.methods.get('init');
    if (initializer) {
      initializer.bind(object).call(interpreter, args);
    }
    return object;
  }

  public findMethod(object: BlintzObject, name: string): BlintzFunction | null {
    const method = this.methods.get(name);
    if (method) {
      return method.bind(object);
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(object, name);
    }

    return null;
  }

  public toString() {
    return this.name;
  }
}
