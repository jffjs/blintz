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

export class FunctionStmt extends Stmt {
  constructor(public name: Token, public parameters: Token[], public body: Stmt[]) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitFunctionStmt(this);
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

export class ReturnStmt extends Stmt {
  constructor(public keyword: Token, public value: Expr | null) {
    super();
  }

  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this);
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
  visitFunctionStmt(expr: FunctionStmt): T;
  visitIfStmt(expr: IfStmt): T;
  visitPrintStmt(expr: PrintStmt): T;
  visitReturnStmt(expr: ReturnStmt): T;
  visitVarStmt(expr: VarStmt): T;
  visitWhileStmt(expr: WhileStmt): T;
}
