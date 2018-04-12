import { Blintz } from './blintz';
import { LiteralVal, Token, TokenType } from './token';

export class Scanner {

  private readonly tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(
    private readonly source: string
  ) { }

  public scanTokens(): Token[] {
    while (!this.isAtEnd) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.Eof, '', null, this.line));

    return this.tokens;
  }

  private get isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LeftParen); break;
      case ')': this.addToken(TokenType.RightParen); break;
      case '{': this.addToken(TokenType.LeftBrace); break;
      case '}': this.addToken(TokenType.RightBrace); break;
      case ',': this.addToken(TokenType.Comma); break;
      case '.': this.addToken(TokenType.Dot); break;
      case '-': this.addToken(TokenType.Minus); break;
      case '+': this.addToken(TokenType.Plus); break;
      case ';': this.addToken(TokenType.Semicolon); break;
      case '*': this.addToken(TokenType.Star); break;
      case '!': this.addToken(this.match('=') ? TokenType.BangEqual : TokenType.Bang); break;
      case '=': this.addToken(this.match('=') ? TokenType.EqualEqual : TokenType.Equal); break;
      case '<': this.addToken(this.match('=') ? TokenType.LessEqual : TokenType.Less); break;
      case '>': this.addToken(this.match('=') ? TokenType.GreaterEqual : TokenType.Greater); break;
      case '/':
        if (this.match('/')) {
          // A comment goes until end of line.
          while (this.peek() !== '\n' && !this.isAtEnd) { this.advance(); }
        } else {
          this.addToken(TokenType.Slash);
        }
        break;
      case ' ':
      case '\t':
      case '\r':
        // Ignore whitespace
        break;
      case '\n':
        this.line++;
        break;
      default:
        Blintz.error(this.line, 'Unexpected character.');
        break;
    }
  }

  private addToken(type: TokenType, literal: LiteralVal = null) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, lexeme, literal, this.line));
  }

  private advance(): string {
    this.current++;
    return this.source[this.current - 1];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd) { return false; }

    if (this.source[this.current] !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd) { return '\0'; }
    return this.source[this.current];
  }
}
