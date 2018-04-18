import * as Expr from './ast/expr';
import * as Stmt from './ast/stmt';
import Blintz from './blintz';
import Interpreter from './interpreter';
import Stack from './stack';
import { Token } from './token';

type Scope = Map<string, boolean>;

export default class Resolver implements Expr.ExprVisitor<void>, Stmt.StmtVisitor<void> {

  private readonly scopes = new Stack<Scope>();

  constructor(private readonly interpreter: Interpreter) { }

  public resolve(node: Expr.Expr | Stmt.Stmt | Stmt.Stmt[]) {
    if (node instanceof Array) {
      const statements = node;
      statements.forEach(statement => this.resolve(statement));
    } else if (node instanceof Stmt.Stmt) {
      const statement = node;
      statement.accept(this);
    } else if (node instanceof Expr.Expr) {
      const expression = node;
      expression.accept(this);
    }
  }

  public visitBlockStmt(stmt: Stmt.BlockStmt): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  public visitExpressionStmt(stmt: Stmt.ExpressionStmt): void {
    this.resolve(stmt.expression);
  }

  public visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt);
  }

  public visitIfStmt(stmt: Stmt.IfStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolve(stmt.elseBranch);
    }
  }

  public visitPrintStmt(stmt: Stmt.PrintStmt): void {
    this.resolve(stmt.expression);
  }

  public visitVarStmt(stmt: Stmt.VarStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  public visitReturnStmt(stmt: Stmt.ReturnStmt): void {
    
  }

  public visitWhileStmt(stmt: Stmt.WhileStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  public visitAssignExpr(expr: Expr.AssignExpr): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitVariableExpr(expr: Expr.VariableExpr): void {
    this.ensureScope(scope => {
      if (scope.get(expr.name.lexeme) === false) {
        Blintz.error(expr.name.line, 'Cannot read local variable in its own initializer.', expr.name);
      }
    });

    this.resolveLocal(expr, expr.name);
  }

  private beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope() {
    this.scopes.pop();
  }

  private ensureScope(callback: (scope: Scope) => any): any {
    const scope = this.scopes.peek();
    if (scope) {
      return callback(scope);
    }
  }

  private declare(name: Token) {
    this.ensureScope(scope => {
      scope.set(name.lexeme, false);
    });
  }

  private define(name: Token) {
    this.ensureScope(scope => {
      scope.set(name.lexeme, true);
    });
  }

  private resolveFunction(fn: Stmt.FunctionStmt) {
    this.beginScope();
    fn.parameters.forEach(param => {
      this.declare(param);
      this.define(param);
    });
    this.resolve(fn.body);
    this.endScope();
  }

  private resolveLocal(expr: Expr.Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes.get(i);
      if (scope && scope.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
