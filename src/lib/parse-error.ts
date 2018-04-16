import Blintz from './blintz';
import { Token } from './token';

export default class ParseError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
    Blintz.error(token.line, message, token);
  }
}
