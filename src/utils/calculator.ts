/**
 * Safe Math Expression Evaluator
 * Emulates the Python SafeCalculator using a recursive descent parser.
 * Supports: +, -, *, /, // (integer division), ** (power), % (mod), parentheses, unary +/-
 */

type TokenType = "NUMBER" | "OP" | "LPAREN" | "RPAREN";

interface Token {
  type: TokenType;
  value: string | number;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.trim();

  while (i < s.length) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/\d/.test(ch) || (ch === "." && i + 1 < s.length && /\d/.test(s[i + 1]))) {
      let numStr = "";
      while (i < s.length && (/[\d.]/.test(s[i]))) {
        numStr += s[i];
        i++;
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) throw new Error(`Invalid number '${numStr}'`);
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }

    // Two-character operators
    if (s.startsWith("**", i)) {
      tokens.push({ type: "OP", value: "**" });
      i += 2;
      continue;
    }
    if (s.startsWith("//", i)) {
      tokens.push({ type: "OP", value: "//" });
      i += 2;
      continue;
    }

    // Single character operators
    if (["+", "-", "*", "/", "%"].includes(ch)) {
      tokens.push({ type: "OP", value: ch });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}'`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  public parse(): number {
    const result = this.expr();
    if (this.pos < this.tokens.length) {
      throw new Error("Unexpected trailing tokens");
    }
    return result;
  }

  // expr -> term ( ('+' | '-') term )*
  private expr(): number {
    let result = this.term();

    while (this.peek()?.type === "OP" && ["+", "-"].includes(this.peek()!.value as string)) {
      const op = this.consume().value as string;
      const right = this.term();
      if (op === "+") result += right;
      else if (op === "-") result -= right;
    }

    return result;
  }

  // term -> factor ( ('*' | '/' | '//' | '%') factor )*
  private term(): number {
    let result = this.factor();

    while (
      this.peek()?.type === "OP" &&
      ["*", "/", "//", "%"].includes(this.peek()!.value as string)
    ) {
      const op = this.consume().value as string;
      const right = this.factor();

      if (op === "*") {
        result *= right;
      } else if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        result /= right;
      } else if (op === "//") {
        if (right === 0) throw new Error("Division by zero");
        result = Math.floor(result / right);
      } else if (op === "%") {
        if (right === 0) throw new Error("Division by zero");
        result %= right;
      }
    }

    return result;
  }

  // factor -> power
  private factor(): number {
    return this.power();
  }

  // power -> unary ( '**' power )? (right-associative)
  private power(): number {
    let base = this.unary();

    if (this.peek()?.type === "OP" && this.peek()!.value === "**") {
      this.consume();
      const exp = this.power();
      if (Math.abs(exp) > 100) {
        throw new Error("The exponent is too large (max 100).");
      }
      base = Math.pow(base, exp);
      if (!isFinite(base) || Math.abs(base) > 1e100) {
        throw new Error("Result exceeds supported range.");
      }
    }

    return base;
  }

  // unary -> ('+' | '-')? primary
  private unary(): number {
    if (this.peek()?.type === "OP" && ["+", "-"].includes(this.peek()!.value as string)) {
      const op = this.consume().value as string;
      const val = this.unary();
      return op === "-" ? -val : val;
    }
    return this.primary();
  }

  // primary -> NUMBER | '(' expr ')'
  private primary(): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "NUMBER") {
      this.consume();
      return token.value as number;
    }

    if (token.type === "LPAREN") {
      this.consume();
      const result = this.expr();
      const closing = this.peek();
      if (closing?.type !== "RPAREN") {
        throw new Error("Missing closing parenthesis");
      }
      this.consume();
      return result;
    }

    throw new Error(`Unexpected token '${token.value}'`);
  }
}

export function evaluateExpression(expression: string): number {
  const sanitized = expression.trim();
  if (!sanitized) throw new Error("Empty expression");
  const tokens = tokenize(sanitized);
  if (tokens.length === 0) throw new Error("Empty expression");
  const parser = new Parser(tokens);
  const result = parser.parse();
  if (isNaN(result) || !isFinite(result)) {
    throw new Error("Invalid mathematical operation");
  }
  return result;
}

export function formatResult(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return value.toString();
  }
  return Number(value.toFixed(8)).toString();
}
