const Level = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const;

type LogLevel = keyof typeof Level;

type LogContext = Record<string, unknown>;

interface LoggerOptions {
  level?: LogLevel;
  name?: string;
  context?: LogContext;
}

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
} as const;

function getEnvLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in Level) return env as LogLevel;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMeta(name: string | undefined, ctx: LogContext): string {
  const parts: string[] = [];
  if (name) parts.push(name);
  const entries = Object.entries(ctx);
  if (entries.length > 0) {
    parts.push(entries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" "));
  }
  return parts.length > 0 ? `${COLORS.dim}[${parts.join(" | ")}]${COLORS.reset} ` : "";
}

class Logger {
  private level: LogLevel;
  private name: string | undefined;
  private ctx: LogContext;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? getEnvLevel();
    this.name = options.name;
    this.ctx = options.context ?? {};
  }

  child(options: Omit<LoggerOptions, "level">): Logger {
    return new Logger({
      level: this.level,
      name: options.name ?? this.name,
      context: { ...this.ctx, ...options.context },
    });
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  private log(level: Exclude<LogLevel, "silent">, message: string, context?: LogContext): void {
    if (Level[level] < Level[this.level]) return;

    const merged = context ? { ...this.ctx, ...context } : this.ctx;
    const meta = formatMeta(this.name, merged);
    const ts = `${COLORS.dim}${timestamp()}${COLORS.reset}`;
    const tag = this.tag(level);

    const line = `${ts} ${tag} ${meta}${message}`;

    switch (level) {
      case "debug":
        console.debug(line);
        break;
      case "info":
        console.info(line);
        break;
      case "warn":
        console.warn(line);
        break;
      case "error":
        console.error(line);
        break;
    }
  }

  private tag(level: Exclude<LogLevel, "silent">): string {
    const labels: Record<Exclude<LogLevel, "silent">, string> = {
      debug: `${COLORS.cyan}DEBUG${COLORS.reset}`,
      info: `${COLORS.blue} INFO${COLORS.reset}`,
      warn: `${COLORS.yellow} WARN${COLORS.reset}`,
      error: `${COLORS.red}ERROR${COLORS.reset}`,
    };
    return labels[level];
  }
}

const logger = new Logger();

export { Logger, logger, type LogContext, type LogLevel, type LoggerOptions };
