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
        const statement = this.declaration();
        if (statement) {
          statements.push(statement);
        }
      }

      return statements;
    } catch (err) {
      return [];
    }
  }

  private declaration(): Stmt.Stmt | null {
    try {
      if (this.match(TokenType.Class)) { return this.classDeclaration(); }
      if (this.match(TokenType.Fun)) { return this.functionDeclaration('function'); }
      if (this.match(TokenType.Var)) { return this.varDeclaration(); }

      return this.statement();
    } catch {
      this.synchronize();
      return null;
    }
  }

  private classDeclaration(): Stmt.Stmt {
    const name = this.consume(TokenType.Identifier, 'Expect class name.');

    let superclass: Expr.VariableExpr | null = null;
    if (this.match(TokenType.Less)) {
      this.consume(TokenType.Identifier, 'Expect superclass name.');
      superclass = new Expr.VariableExpr(this.previous());
    }

    this.consume(TokenType.LeftBrace, `Expect '{' before class body.`);

    const methods: Stmt.FunctionStmt[] = [];
    while (!this.check(TokenType.RightBrace) && !this.isAtEnd) {
      methods.push(this.functionDeclaration('method'));
    }
    this.consume(TokenType.RightBrace, `Expect '}' after class body.`);

    return new Stmt.ClassStmt(name, methods, superclass);
  }

  private functionDeclaration(kind: string): Stmt.FunctionStmt {
    const name = this.consume(TokenType.Identifier, `Expect ${kind} name.`);
    this.consume(TokenType.LeftParen, `Expect '(' after ${kind} name.`);
    const parameters: Token[] = [];
    if (!this.check(TokenType.RightParen)) {
      do {
        if (parameters.length >= 8) {
          throw new ParseError(this.peek(), 'Cannot have more than 8 parameters.');
        }

        parameters.push(this.consume(TokenType.Identifier, 'Expect parameter name.'));
      } while (this.match(TokenType.Comma));
    }
    this.consume(TokenType.RightParen, `Expect ')' after parameters.`);

    this.consume(TokenType.LeftBrace, `Expect '{' before ${kind} body.`);
    const body = this.block();

    return new Stmt.FunctionStmt(name, parameters, body);
  }

  private varDeclaration(): Stmt.Stmt {
    const name = this.consume(TokenType.Identifier, 'Expect variable name.');
    let initializer = null;

    if (this.match(TokenType.Equal)) {
      initializer = this.expression();
    }

    this.consume(TokenType.Semicolon, `Expect ';' after variable  declaration.`);

    return new Stmt.VarStmt(name, initializer);
  }

  private statement(): Stmt.Stmt {
    if (this.match(TokenType.For)) { return this.forStatement(); }
    if (this.match(TokenType.If)) { return this.ifStatement(); }
    if (this.match(TokenType.Print)) { return this.printStatement(); }
    if (this.match(TokenType.Return)) { return this.returnStatement(); }
    if (this.match(TokenType.While)) { return this.whileStatement(); }
    if (this.match(TokenType.LeftBrace)) { return new Stmt.BlockStmt(this.block()); }

    return this.expressionStatement();
  }

  private block(): Stmt.Stmt[] {
    const statements: Stmt.Stmt[] = [];

    while (!this.check(TokenType.RightBrace) && !this.isAtEnd) {
      const statement = this.declaration();
      if (statement) {
        statements.push(statement);
      }
    }

    this.consume(TokenType.RightBrace, `Expect '}' after block.`);

    return statements;
  }

  private forStatement(): Stmt.Stmt {
    this.consume(TokenType.LeftParen, `Expect '(' after 'for'.`);

    let initializer: Stmt.Stmt | null;
    if (this.match(TokenType.Semicolon)) {
      initializer = null;
    } else if (this.match(TokenType.Var)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr.Expr | null = null;
    if(!this.check(TokenType.Semicolon)) {
      condition = this.expression();
    }
    this.consume(TokenType.Semicolon, `Expect ';' after loop condition.`);

    let increment: Expr.Expr | null = null;
    if(!this.check(TokenType.RightParen)) {
      increment = this.expression();
    }
    this.consume(TokenType.RightParen, `Expect ')' after for clauses.`);

    let body = this.statement();

    if (increment) {
      body = new Stmt.BlockStmt([body, new Stmt.ExpressionStmt(increment)]);
    }

    if (!condition) {
      condition = new Expr.LiteralExpr(true);
    }
    body = new Stmt.WhileStmt(condition, body);

    if (initializer) {
      body = new Stmt.BlockStmt([initializer, body]);
    }

    return body;
  }

  private ifStatement(): Stmt.Stmt {
    this.consume(TokenType.LeftParen, `Expect '(' after 'if'.`);
    const condition = this.expression();
    this.consume(TokenType.RightParen, `Expect ')' after if condition.`);

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(TokenType.Else)) {
      elseBranch = this.statement();
    }

    return new Stmt.IfStmt(condition, thenBranch, elseBranch);
  }

  private printStatement(): Stmt.Stmt {
    const value = this.expression();
    this.consume(TokenType.Semicolon, `Expect ';' after value.`);
    return new Stmt.PrintStmt(value);
  }

  private returnStatement(): Stmt.Stmt {
    const keyword = this.previous();
    let value = null;
    if (!this.check(TokenType.Semicolon)) {
      value = this.expression();
    }

    this.consume(TokenType.Semicolon, `Expect ';' after return value.`);
    return new Stmt.ReturnStmt(keyword, value);
  }

  private whileStatement(): Stmt.Stmt {
    this.consume(TokenType.LeftParen, `Expect '(' after 'while'.`);
    const condition = this.expression();
    this.consume(TokenType.RightParen, `Expect ')' after while condition.`);
    const body = this.statement();

    return new Stmt.WhileStmt(condition, body);
  }

  private expressionStatement(): Stmt.Stmt {
    const expression = this.expression();
    this.consume(TokenType.Semicolon, `Expect ';' after expression.`);
    return new Stmt.ExpressionStmt(expression);
  }

  private expression(): Expr.Expr {
    return this.assignment();
  }

  private assignment(): Expr.Expr {
    const expr = this.or();

    if (this.match(TokenType.Equal)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.VariableExpr) {
        const name = expr.name;
        return new Expr.AssignExpr(name, value);
      } else if (expr instanceof Expr.GetExpr) {
        const get = expr;
        return new Expr.SetExpr(get.object, get.name, value);
      }

      throw new ParseError(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  private or(): Expr.Expr {
    let expr = this.and();

    while (this.match(TokenType.Or)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Expr.LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr.Expr {
    let expr = this.equality();

    while (this.match(TokenType.And)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Expr.LogicalExpr(expr, operator, right);
    }

    return expr;
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

    return this.call();
  }

  private call(): Expr.Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LeftParen)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.Dot)) {
        const name = this.consume(TokenType.Identifier, `Expect property name after '.'.`);
        expr = new Expr.GetExpr(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr.Expr): Expr.Expr {
    const args: Expr.Expr[] = [];

    if (!this.check(TokenType.RightParen)) {
      do {
        if (args.length >= 8) {
          throw new ParseError(this.peek(), 'Cannot have more than 8 arguments.');
        }
        args.push(this.expression());
      } while (this.match(TokenType.Comma));
    }

    const paren = this.consume(TokenType.RightParen, `Expect ')' after arguments.`);

    return new Expr.CallExpr(callee, paren, args);
  }

  private primary(): Expr.Expr {
    if (this.match(TokenType.False)) { return new Expr.LiteralExpr(false); }

    if (this.match(TokenType.Identifier)) { return new Expr.VariableExpr(this.previous()); }

    if (this.match(TokenType.LeftParen)) {
      const expr = this.expression();
      this.consume(TokenType.RightParen, `Expect ')' after expression.`);
      return new Expr.GroupingExpr(expr);
    }

    if (this.match(TokenType.Nil)) { return new Expr.LiteralExpr(null); }

    if (this.match(TokenType.Number, TokenType.String)) {
      return new Expr.LiteralExpr(this.previous().literal);
    }

    if (this.match(TokenType.Super)) {
      const keyword = this.previous();
      this.consume(TokenType.Dot, `Expect '.' after 'super'.`);
      const method = this.consume(TokenType.Identifier, 'Expect superclass method name.');
      return new Expr.SuperExpr(keyword, method);
    }

    if (this.match(TokenType.This)) { return new Expr.ThisExpr(this.previous()); }
    if (this.match(TokenType.True)) { return new Expr.LiteralExpr(true); }


    throw new ParseError(this.peek(), 'Expect expression.');
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

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) { return this.advance(); }

    throw new ParseError(this.peek(), message);
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd) {
      if (this.previous().type === TokenType.Eof) { return; }

      switch (this.peek().type) {
        case TokenType.Class:
        case TokenType.Fun:
        case TokenType.Var:
        case TokenType.For:
        case TokenType.If:
        case TokenType.While:
        case TokenType.Print:
        case TokenType.Return:
          return;
      }

      this.advance();
    }
  }
}
