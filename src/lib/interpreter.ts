import * as Expr from './ast/expr';
import * as Stmt from './ast/stmt';
import Environment from './environment';
import { printLn } from './print';
import RuntimeError from './runtime-error';
import { Token, TokenType } from './token';
import { stringify, Value } from './value';

export default class Interpreter implements Expr.ExprVisitor<Value>, Stmt.StmtVisitor<void> {

  private environment = new Environment();

  public interpret(statements: Stmt.Stmt[]): void {
    try {
      statements.forEach(statement => this.execute(statement));
    } catch (err) {
      return;
    }
  }

  public visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  public visitIfStmt(stmt: Stmt.IfStmt): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
        this.execute(stmt.elseBranch);
    }
  }

  public visitPrintStmt(stmt: Stmt.PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    printLn(stringify(value));
  }

  public visitVarStmt(stmt: Stmt.VarStmt): void {
    let value: Value = null;

    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitWhileStmt(stmt: Stmt.WhileStmt): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  public visitAssignExpr(expr: Expr.AssignExpr): Value {
    const value = this.evaluate(expr.value);

    this.environment.assign(expr.name, value);

    return value;
  }

  public visitBinaryExpr(expr: Expr.BinaryExpr): Value {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BangEqual:
        return !this.isEqual(left, right);
      case TokenType.EqualEqual:
        return this.isEqual(left, right);
      case TokenType.Greater:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GreaterEqual:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.Less:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.GreaterEqual:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);
      case TokenType.Minus:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.Plus:
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }

        if (typeof left === 'string' && typeof right === 'string') {
          return (left as string).concat(right as string);
        }

        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.');
      case TokenType.Slash:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);
      case TokenType.Star:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);
    }

    // should be unreachable
    throw new RuntimeError(expr.operator, 'Something has gone wrong.');
  }

  public visitGroupingExpr(expr: Expr.GroupingExpr): Value {
    return this.evaluate(expr.expression);
  }

  public visitLiteralExpr(expr: Expr.LiteralExpr): Value {
    return expr.value as Value;
  }

  public visitLogicalExpr(expr: Expr.LogicalExpr): Value {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.Or) {
      if (this.isTruthy(left)) { return left; }
    } else {
      if (!this.isTruthy(left)) { return left; }
    }

    return this.evaluate(expr.right);
  }

  public visitUnaryExpr(expr: Expr.UnaryExpr): Value {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.Minus:
        this.checkNumberOperand(expr.operator, right);
        return -(right as number);
      case TokenType.Bang:
        return !this.isTruthy(right);
    }

    // should be unreachable
    throw new RuntimeError(expr.operator, 'Something has gone wrong.');
  }

  public visitVariableExpr(expr: Expr.VariableExpr): Value {
    return this.environment.get(expr.name);
  }

  private execute(stmt: Stmt.Stmt): void {
    stmt.accept(this);
  }

  private executeBlock(statements: Stmt.Stmt[], environment: Environment): void {
    const previous: Environment = this.environment;

    try {
      this.environment = environment;
      statements.forEach(statement => {
        this.execute(statement);
      });
    } finally {
      this.environment = previous;
    }
  }

  private evaluate(expr: Expr.Expr): Value {
    return expr.accept(this);
  }

  private isEqual(a: Value, b: Value): boolean {
    return a === b;
  }

  private isTruthy(value: Value) {
    if (value === null) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return true;
  }

  private checkNumberOperand(operator: Token, operand: Value) {
    if (typeof operand === 'number') { return; }
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(operator: Token, left: Value, right: Value) {
    if (typeof left === 'number' && typeof right === 'number') { return; }
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }
}
