import { existsSync, mkdirSync, writeFileSync } from 'fs';

export interface AstSpec {
  [t: string]: string[];
}

export class AstGenerator {

  constructor(
    private outputDir: string,
    private baseName: string,
    private astSpec: AstSpec
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
    return `import { LiteralVal, Token } from '../token';`;
  }

  private defineBase(): string {
    return `
export abstract class ${this.baseName} {
  public abstract accept<T>(visitor: ${this.baseName}Visitor<T>): T;
}`;
  }

  private defineType(type: string, fieldList: string[]): string {
    const className = type + this.baseName;
    return `
export class ${className} extends ${this.baseName} {
  constructor(${fieldList.join(', ')}) {
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
export interface ExprVisitor<T> {
  ${methods}
}
`;
  }
}

const exprGenerator = new AstGenerator('./src/lib/ast', 'Expr', {
  'Binary': [
    'public left: Expr',
    'public operator: Token',
    'public right: Expr'
  ],
  'Grouping': [
    'public expression: Expr'
  ],
  'Literal': [
    'public value: LiteralVal'
  ],
  'Unary': [
    'public operator: Token',
    'public right: Expr'
  ]
});

exprGenerator.run();
