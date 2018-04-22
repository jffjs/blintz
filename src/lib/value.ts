import { Callable } from './callable';
import BlintzObject from './object';

export type Primitive = boolean | number | string | null;
export type Value = BlintzObject | Callable | Primitive;

export function stringify(value: Value) {
  if (value === null) {
    return 'nil';
  } else {
    return value.toString();
  }
}
