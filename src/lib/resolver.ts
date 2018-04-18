import * as Expr from './ast/expr';
import * as Stmt from './ast/stmt';
import Blintz from './blintz';
import Interpreter from './interpreter';
import Stack from './stack';
import { Token } from './token';

enum FunctionType {
  None,
  Function
}

type Scope = Map<string, boolean>;

export default class Resolver implements Expr.ExprVisitor<void>, Stmt.StmtVisitor<void> {

  private currentFunction = FunctionType.None;
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

    this.resolveFunction(stmt, FunctionType.Function);
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
    if (this.currentFunction === FunctionType.None) {
      Blintz.error(stmt.keyword.line, 'Cannot return from top-level code.', stmt.keyword);
    }

    if (stmt.value) {
      this.resolve(stmt.value);
    }
  }

  public visitWhileStmt(stmt: Stmt.WhileStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  public visitAssignExpr(expr: Expr.AssignExpr): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitBinaryExpr(expr: Expr.BinaryExpr): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitCallExpr(expr: Expr.CallExpr): void {
    this.resolve(expr.callee);

    expr.args.forEach(arg => this.resolve(arg));
  }

  public visitGroupingExpr(expr: Expr.GroupingExpr): void {
    this.resolve(expr.expression);
  }

  public visitLiteralExpr(): void {
    return;
  }

  public visitLogicalExpr(expr: Expr.LogicalExpr): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitUnaryExpr(expr: Expr.UnaryExpr): void {
    this.resolve(expr.right);
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
      if (scope.has(name.lexeme)) {
        Blintz.error(name.line, 'Variable with this name already declared in this scope.', name);
      }
    });
  }

  private define(name: Token) {
    this.ensureScope(scope => {
      scope.set(name.lexeme, true);
    });
  }

  private resolveFunction(fn: Stmt.FunctionStmt, type: FunctionType) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    fn.parameters.forEach(param => {
      this.declare(param);
      this.define(param);
    });
    this.resolve(fn.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
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
