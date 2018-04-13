import { test } from 'ava';

import AstPrinter from './ast-printer';
import * as Expr from './ast/expr';
import { Token, TokenType } from './token';

const astPrinter = new AstPrinter();

test('print nil expr', t => {
  const nilExpr = new Expr.LiteralExpr(null);

  t.is(astPrinter.print(nilExpr), 'nil');
});

test('print string expr', t => {
  const expr = new Expr.LiteralExpr('foobar');

  t.is(astPrinter.print(expr), '"foobar"');
});

test('print binary expr', t => {
  const expr = new Expr.BinaryExpr(
    new Expr.LiteralExpr(123),
    new Token(TokenType.Plus, '+', null, 1),
    new Expr.LiteralExpr(456)
  );

  t.is(astPrinter.print(expr), '(+ 123 456)');
});

test('print complex expr', t => {
  const expr = new Expr.BinaryExpr(
    new Expr.UnaryExpr(
      new Token(TokenType.Minus, '-', null, 1),
      new Expr.LiteralExpr(123)
    ),
    new Token(TokenType.Star, '*', null, 1),
    new Expr.GroupingExpr(new Expr.LiteralExpr(45.67))
  );

  t.is(astPrinter.print(expr), '(* (- 123) (group 45.67))');
});
