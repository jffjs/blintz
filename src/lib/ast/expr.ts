// This is a generated file. Do not edit manually.
// Run `yarn gen:ast` to generate.
/* tslint:disable */

import { Token } from '../token';
import { Value } from '../value';

export abstract class Expr {
  public abstract accept<T>(visitor: ExprVisitor<T>): T;
}

export class AssignExpr extends Expr {
  constructor(public name: Token, public value: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

export class BinaryExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class CallExpr extends Expr {
  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

export class GetExpr extends Expr {
  constructor(public object: Expr, public name: Token) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
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

export class LogicalExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

export class SetExpr extends Expr {
  constructor(public object: Expr, public name: Token, public value: Expr) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetExpr(this);
  }
}

export class ThisExpr extends Expr {
  constructor(public keyword: Token) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitThisExpr(this);
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

export class VariableExpr extends Expr {
  constructor(public name: Token) {
    super();
  }

  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

export interface ExprVisitor<T> {
  visitAssignExpr(expr: AssignExpr): T;
  visitBinaryExpr(expr: BinaryExpr): T;
  visitCallExpr(expr: CallExpr): T;
  visitGetExpr(expr: GetExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitLiteralExpr(expr: LiteralExpr): T;
  visitLogicalExpr(expr: LogicalExpr): T;
  visitSetExpr(expr: SetExpr): T;
  visitThisExpr(expr: ThisExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
  visitVariableExpr(expr: VariableExpr): T;
}
