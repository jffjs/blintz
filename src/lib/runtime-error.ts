import Blintz from './blintz';
import { Token } from './token';

export default class RuntimeError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
    Blintz.runtimeError(this);
  }
}
