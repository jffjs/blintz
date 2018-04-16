// This is a generated file. Do not edit manually.
// Run `yarn gen:ast` to generate.
/* tslint:disable */
import { Value, Token } from '../token';

export abstract class Expr {
  public abstract accept<T>(visitor: ExprVisitor<T>): T;
}

export class BinaryExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class GroupingExpr extends Expr {
  constructor(public expression: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class LiteralExpr extends Expr {
  constructor(public value: Value) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class UnaryExpr extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export interface ExprVisitor<T> {
  visitBinaryExpr(expr: BinaryExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitLiteralExpr(expr: LiteralExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
}
