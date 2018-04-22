import * as Expr from './ast/expr';
import * as Stmt from './ast/stmt';
import { isCallable } from './callable';
import BlintzClass from './class';
import Environment from './environment';
import BlintzFunction from './function';
import BlintzObject from './object';
import { printLn } from './print';
import Return from './return';
import RuntimeError from './runtime-error';
import { Token, TokenType } from './token';
import { stringify, Value } from './value';

export default class Interpreter implements Expr.ExprVisitor<Value>, Stmt.StmtVisitor<void> {

  public readonly globals = new Environment();

  private environment = this.globals;
  private readonly locals = new Map<Expr.Expr, number>();

  constructor() {
    this.globals.define('clock', {
      arity: () => 0,
      call: () => {
        return new Date().valueOf() / 1000;
      }
    });
  }

  public interpret(statements: Stmt.Stmt[]) {
    try {
      statements.forEach(statement => this.execute(statement));
    } catch (err) {
      return;
    }
  }

  public resolve(expr: Expr.Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  public visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitClassStmt(stmt: Stmt.ClassStmt): void {
    this.environment.define(stmt.name.lexeme, null);
    const methods = new Map<string, BlintzFunction>();
    stmt.methods.forEach(method => {
      const fn = new BlintzFunction(method, this.environment);
      methods.set(method.name.lexeme, fn);
    });

    const klass = new BlintzClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
  }

  public visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  public visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    const fn = new BlintzFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, fn);
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

  public visitReturnStmt(stmt: Stmt.ReturnStmt): void {
    let value = null;
    if (stmt.value) {
      value = this.evaluate(stmt.value);
    }

    throw new Return(value);
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

    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

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
      case TokenType.LessEqual:
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

  public visitCallExpr(expr: Expr.CallExpr): Value {
    const callee = this.evaluate(expr.callee);
    const args = expr.args.map(arg => this.evaluate(arg));

    if (isCallable(callee)) {
      if (args.length !== callee.arity()) {
        throw new RuntimeError(expr.paren, `Expected ${callee.arity()} arguments but got ${args.length}.`);
      }
      return callee.call(this, args);
    } else {
      throw new RuntimeError(expr.paren, 'Can only call functions and classes.');
    }
  }

  public visitGetExpr(expr: Expr.GetExpr): Value {
    const object = this.evaluate(expr.object);
    if (object instanceof BlintzObject) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, 'Only objects have properties.');
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

  public visitSetExpr(expr: Expr.SetExpr): Value {
    const object = this.evaluate(expr.object);

    if (object instanceof BlintzObject) {
      const value = this.evaluate(expr.value);
      object.set(expr.name, value);
      return value;
    } else {
      throw new RuntimeError(expr.name, 'Only objects have fields.');
    }
  }

  public visitThisExpr(expr: Expr.ThisExpr): Value {
    return this.lookUpVariable(expr.keyword, expr);
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
    return this.lookUpVariable(expr.name, expr);
  }

  public execute(stmt: Stmt.Stmt): void {
    stmt.accept(this);
  }

  public executeBlock(statements: Stmt.Stmt[], environment: Environment): void {
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

  private lookUpVariable(name: Token, expr: Expr.Expr): Value {
    const distance = this.locals.get(expr);

    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }
}
