// This is a generated file. Do not edit manually.
// Run `yarn gen:ast` to generate.
/* tslint:disable */

import { Expr } from './expr';
import { Token } from '../token';

export abstract class Stmt {
  public abstract accept<T>(visitor: StmtVisitor<T>): T;
}

export class BlockStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

export class ExpressionStmt extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class IfStmt extends Stmt {
  constructor(public condition: Expr, public thenBranch: Stmt, public elseBranch: Stmt | null) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
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

export class VarStmt extends Stmt {
  constructor(public name: Token, public initializer: Expr | null) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}

export class WhileStmt extends Stmt {
  constructor(public condition: Expr, public body: Stmt) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

export interface StmtVisitor<T> {
  visitBlockStmt(expr: BlockStmt): T;
  visitExpressionStmt(expr: ExpressionStmt): T;
  visitIfStmt(expr: IfStmt): T;
  visitPrintStmt(expr: PrintStmt): T;
  visitVarStmt(expr: VarStmt): T;
  visitWhileStmt(expr: WhileStmt): T;
}
