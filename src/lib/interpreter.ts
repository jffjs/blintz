import * as Ast from './ast/expr';
import RuntimeError from './runtime-error';
import { Token, TokenType } from './token';
import { Value } from './value';

export default class Interpreter implements Ast.ExprVisitor<Value> {

  public interpret(expression: Ast.Expr): Value {
    return this.evaluate(expression);
  }

  public visitBinaryExpr(expr: Ast.BinaryExpr): Value {
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

  public visitGroupingExpr(expr: Ast.GroupingExpr): Value {
    return this.evaluate(expr.expression);
  }

  public visitLiteralExpr(expr: Ast.LiteralExpr): Value {
    return expr.value as Value;
  }

  public visitUnaryExpr(expr: Ast.UnaryExpr): Value {
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

  private evaluate(expr: Ast.Expr): Value {
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
