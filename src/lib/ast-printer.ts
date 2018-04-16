import * as Expr from './ast/expr';

export default class AstPrinter implements Expr.ExprVisitor<string> {
  public print(expr: Expr.Expr): string {
    return expr.accept(this);
  }

  public visitAssignExpr(expr: Expr.AssignExpr): string {
    return this.parenthesize(`assign ${expr.name.lexeme}`, expr.value);
  }

  public visitBinaryExpr(expr: Expr.BinaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Expr.GroupingExpr): string {
    return this.parenthesize('group', expr.expression);
  }

  public visitLiteralExpr(expr: Expr.LiteralExpr): string {
    const value = expr.value;
    if (value) {
      const strValue = value.toString();
      if (typeof value === 'string') {
        return `"${strValue}"`;
      } else {
        return strValue;
      }
    } else {
      return 'nil';
    }
  }

  public visitUnaryExpr(expr: Expr.UnaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  public visitVariableExpr(expr: Expr.VariableExpr): string {
    return this.parenthesize(expr.name.lexeme);
  }

  private parenthesize(name: string, ...exprs: Expr.Expr[]): string {
    const strExprs = exprs.map((expr: Expr.Expr) => {
      return expr.accept(this);
    }).join(' ');

    return `(${name} ${strExprs})`;
  }
}
