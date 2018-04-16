import Blintz from './blintz';
import { Token } from './token';

export default class ParseError extends Error {
  constructor(message: string, token: Token) {
    Blintz.error(token.line, message, token);
    super(message);
  }
}
