import * as Expr from './ast/expr';
import * as Stmt from './ast/stmt';
import ParseError from './parse-error';
import { Token, TokenType } from './token';

export default class Parser {
  private current = 0;

  constructor(
    private tokens: Token[]
  ) { }

  public parse(): Stmt.Stmt[] {
    try {
      const statements: Stmt.Stmt[] = [];
      while (!this.isAtEnd) {
        statements.push(this.statement());
      }

      return statements;
    } catch (err) {
      return [];
    }
  }

  private statement(): Stmt.Stmt {
    if (this.match(TokenType.Print)) {
      return this.printStatement();
    }

    return this.expressionStatement();
  }

  private printStatement(): Stmt.Stmt {
    const value = this.expression();
    this.consume(TokenType.Semicolon, `Expect ';' after value.`);
    return new Stmt.PrintStmt(value);
  }

  private expressionStatement(): Stmt.Stmt {
    const expression = this.expression();
    this.consume(TokenType.Semicolon, `Expect ';' after expression.`);
    return new Stmt.ExpressionStmt(expression);
  }

  private expression(): Expr.Expr {
    return this.equality();
  }

  private equality(): Expr.Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BangEqual, TokenType.EqualEqual)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Expr.BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private comparison(): Expr.Expr {
    let expr = this.addition();

    while (this.match(TokenType.Greater, TokenType.GreaterEqual, TokenType.Less, TokenType.LessEqual)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Expr.BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private addition(): Expr.Expr {
    let expr = this.multiplication();

    while (this.match(TokenType.Plus, TokenType.Minus)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Expr.BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private multiplication(): Expr.Expr {
    let expr = this.unary();

    while (this.match(TokenType.Star, TokenType.Slash)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private unary(): Expr.Expr {
    if (this.match(TokenType.Bang, TokenType.Minus)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.UnaryExpr(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr.Expr {
    if (this.match(TokenType.False)) { return new Expr.LiteralExpr(false); }
    if (this.match(TokenType.True)) { return new Expr.LiteralExpr(true); }
    if (this.match(TokenType.Nil)) { return new Expr.LiteralExpr(null); }

    if (this.match(TokenType.Number, TokenType.String)) {
      return new Expr.LiteralExpr(this.previous().literal);
    }

    if (this.match(TokenType.LeftParen)) {
      const expr = this.expression();
      this.consume(TokenType.RightParen, `Expect ')' after expression.`);
      return new Expr.GroupingExpr(expr);
    }

    throw new ParseError('Expect expression.', this.peek());
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const tokenType of tokenTypes) {
      if (this.check(tokenType)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(tokenType: TokenType): boolean {
    if (this.isAtEnd) { return false; }
    return this.peek().type === tokenType;
  }

  private advance(): Token {
    if (!this.isAtEnd) { this.current++; }
    return this.previous();
  }

  private get isAtEnd(): boolean {
    return this.peek().type === TokenType.Eof;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) { return this.advance(); }

    throw new ParseError(message, this.peek());
  }

  // private synchronize() {
  //   this.advance();

  //   while (!this.isAtEnd) {
  //     if (this.previous().type === TokenType.Eof) { return; }

  //     switch (this.peek().type) {
  //       case TokenType.Class:
  //       case TokenType.Fun:
  //       case TokenType.Var:
  //       case TokenType.For:
  //       case TokenType.If:
  //       case TokenType.While:
  //       case TokenType.Print:
  //       case TokenType.Return:
  //         return;
  //     }

  //     this.advance();
  //   }
  // }
}
