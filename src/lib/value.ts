import BlintzFunction from './function';

export type Primitive = boolean | number | string | null;
export type Value = BlintzFunction | Primitive;

export function stringify(value: Value) {
  if (value === null) {
    return 'nil';
  } else {
    return value.toString();
  }
}
