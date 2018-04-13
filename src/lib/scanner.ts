
import { Blintz } from './blintz';
import { LiteralVal, Token, TokenType } from './token';

interface KeywordMap {
  [k: string]: TokenType;
}

export class Scanner {
  private static readonly keywords: KeywordMap = {
    'and': TokenType.And,
    'class': TokenType.Class,
    'else': TokenType.Else,
    'false': TokenType.False,
    'for': TokenType.For,
    'fun': TokenType.Fun,
    'if': TokenType.If,
    'nil': TokenType.Nil,
    'or': TokenType.Or,
    'print': TokenType.Print,
    'return': TokenType.Return,
    'super': TokenType.Super,
    'this': TokenType.This,
    'true': TokenType.True,
    'var': TokenType.Var,
    'while': TokenType.While
  };

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
      case '"': this.scanString(); break;
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
        if (this.isDigit(c)) {
          this.scanNumber();
        } else if (this.isAlpha(c)){
          this.scanIdentifier();
        } else {
          Blintz.error(this.line, 'Unexpected character.');
        }
        break;
    }
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      (c === '_');
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
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

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }
    return this.source[this.current + 1];
  }

  private scanString() {
    while (this.peek() !== '"' && !this.isAtEnd) {
      if (this.peek() === '\n') { this. line++; }
      this.advance();
    }

    // Unterminated string
    if (this.isAtEnd) {
      Blintz.error(this.line, 'Unterminated string.');
      return;
    }

    // Closing "
    this.advance();

    // Trim the surrounding quotes.
    const strValue = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.String, strValue);
  }

  private scanNumber() {
    while (this.isDigit(this.peek())) { this.advance(); }

    // Look for fractional part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // Consume the '.'

      while (this.isDigit(this.peek())) { this.advance(); }
    }

    const numValue = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.Number, numValue);
  }

  private scanIdentifier() {
    while (this.isAlphaNumeric(this.peek())) { this.advance(); }

    const text = this.source.substring(this.start, this.current);
    const tokType = Scanner.keywords[text] || TokenType.Identifier;
    this.addToken(tokType);
  }
}
