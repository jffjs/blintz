import Interpreter from './interpreter';
import { Value } from './value';

export interface Callable {
  arity(): number;
  call(interpreter: Interpreter, args: Value[]): Value;
}

export function isCallable(value: Value): value is Callable {
  return (value as Callable).call !== undefined;
}
