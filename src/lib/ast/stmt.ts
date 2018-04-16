// This is a generated file. Do not edit manually.
// Run `yarn gen:ast` to generate.
/* tslint:disable */

import { Expr } from './expr'

export abstract class Stmt {
  public abstract accept<T>(visitor: StmtVisitor<T>): T;
}

export class ExpressionStmt extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class PrintStmt extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}

export interface StmtVisitor<T> {
  visitExpressionStmt(expr: ExpressionStmt): T;
  visitPrintStmt(expr: PrintStmt): T;
}
