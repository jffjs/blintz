import { existsSync, mkdirSync, writeFileSync } from 'fs';

export interface AstSpec {
  [t: string]: string[];
}

export class AstGenerator {

  constructor(
    private outputDir: string,
    private baseName: string,
    private astSpec: AstSpec,
    private imports: string[] = []
  ) { }

  public run() {
    const classes = Object.keys(this.astSpec).map((type: string) => {
      const spec = this.astSpec[type];
      return this.defineType(type, spec);
    }).join('\n');

    const fileContent = `// This is a generated file. Do not edit manually.
// Run \`yarn gen:ast\` to generate.
/* tslint:disable */

${this.defineImports()}
${this.defineBase()}
${classes}
${this.defineVisitor()}`;

    const fileName = this.baseName.toLowerCase();

    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir);
    }

    writeFileSync(`${this.outputDir}/${fileName}.ts`, fileContent, 'utf8');
  }

  private defineImports(): string {
    return this.imports.join('\n');
  }

  private defineBase(): string {
    return `
export abstract class ${this.baseName} {
  public abstract accept<T>(visitor: ${this.baseName}Visitor<T>): T;
}`;
  }

  private defineType(type: string, fieldList: string[]): string {
    const className = type + this.baseName;
    const fields = fieldList.map(field => `public ${field}`).join(', ');
    return `
export class ${className} extends ${this.baseName} {
  constructor(${fields}) {
    super();
  }

  public accept<T>(visitor: ${this.baseName}Visitor<T>): T {
    return visitor.visit${className}(this);
  }
}`;
  }

  private defineVisitor(): string {
    const methods = Object.keys(this.astSpec).map((type: string) => {
      const className = type + this.baseName;
      return `visit${className}(expr: ${className}): T;`;
    }).join('\n  ');

    return `
export interface ${this.baseName}Visitor<T> {
  ${methods}
}
`;
  }
}

const exprGenerator = new AstGenerator('./src/lib/ast', 'Expr', {
  'Assign': [
    'name: Token',
    'value: Expr'
  ],
  'Call': [
    'callee: Expr',
    'paren: Token',
    'args: Expr[]'
  ],
  'Binary': [
    'left: Expr',
    'operator: Token',
    'right: Expr'
  ],
  'Grouping': [
    'expression: Expr'
  ],
  'Literal': [
    'value: Value'
  ],
  'Logical': [
    'left: Expr',
    'operator: Token',
    'right: Expr'
  ],
  'Unary': [
    'operator: Token',
    'right: Expr'
  ],
  'Variable': [
    'name: Token'
  ]
}, [`import { Token } from '../token';`, `import { Value } from '../value';`]);

exprGenerator.run();

const stmtGenerator = new AstGenerator('./src/lib/ast', 'Stmt', {
  'Block': [
    'statements: Stmt[]'
  ],
  'Expression': [
    'expression: Expr'
  ],
  'If': [
    'condition: Expr',
    'thenBranch: Stmt',
    'elseBranch: Stmt | null'
  ],
  'Print': [
    'expression: Expr'
  ],
  'Var': [
    'name: Token',
    'initializer: Expr | null'
  ],
  'While': [
    'condition: Expr',
    'body: Stmt'
  ]
}, [`import { Expr } from './expr';`, `import { Token } from '../token';`]);

stmtGenerator.run();
