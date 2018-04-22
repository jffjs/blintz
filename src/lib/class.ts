import { Callable } from './callable';
import BlintzFunction from './function';
import BlintzObject from './object';
import { Value } from './value';

export default class BlintzClass implements Callable {

  constructor(
    public readonly name: string,
    private readonly methods: Map<string, BlintzFunction>
  ) { }

  public arity(): number {
    return 0;
  }

  public call(): Value {
    const object = new BlintzObject(this);
    return object;
  }

  public findMethod(object: BlintzObject, name: string): BlintzFunction | null {
    const method = this.methods.get(name);
    if (method) {
      return method.bind(object);
    } else {
      return null;
    }
  }

  public toString() {
    return this.name;
  }
}
