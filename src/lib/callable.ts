import Interpreter from './interpreter';
import { Value } from './value';

export default interface Callable {
  call(interpreter: Interpreter, args: Value[]): Value;
}
