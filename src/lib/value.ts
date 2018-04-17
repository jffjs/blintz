import BlintzFunction from './function';

export type Value = BlintzFunction | boolean | number | string | null;

export function stringify(value: Value) {
  if (value === null) {
    return 'nil';
  } else {
    return value.toString();
  }
}
