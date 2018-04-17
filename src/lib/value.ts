import { Callable } from './callable';

export type Primitive = boolean | number | string | null;
export type Value = Callable | Primitive;

export function stringify(value: Value) {
  if (value === null) {
    return 'nil';
  } else {
    return value.toString();
  }
}
