export type LogLevel = 'critical' | 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  id: string;
  level: LogLevel;
  category: string;
  component: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  stack?: string;
  // legacy/aux fields
  source?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  userId?: string;
  userRole?: string;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<string, number>;
  errorCount24h?: number;
  lastError?: { timestamp: number; message: string } | null;
}

class LoggingService {
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
  private logs: LogEntry[] = [];

  // Overloaded error: (msg, error) or (category, component, msg, context, stack)
  error(message: string, error?: unknown): void;
  error(
    category: string,
    component: string,
    message: string,
    context?: Record<string, unknown>,
    stack?: string,
  ): void;
  error(a: string, b?: unknown, c?: string, d?: Record<string, unknown>, e?: string) {
    if (c !== undefined) {
      // category, component, message, context, stack
      this.pushLog('error', a, String(b), c, d, e);
    } else {
      console.error(`[ERROR] ${a}`, b);
      this.pushLog('error', 'app', 'general', a, typeof b === 'object' ? (b as any) : undefined);
    }
  }

  warn(category: string, component: string, message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] [${category}:${component}] ${message}`, context);
      this.pushLog('warn', category, component, message, context);
    }
  }

  info(category: string, component: string, message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] [${category}:${component}] ${message}`, context);
      this.pushLog('info', category, component, message, context);
    }
  }

  // Overloaded debug: (msg, data) or (category, component, msg, context)
  debug(message: string, data?: unknown): void;
  debug(
    category: string,
    component: string,
    message: string,
    context?: Record<string, unknown>,
  ): void;
  debug(a: string, b?: unknown, c?: string, d?: Record<string, unknown>) {
    if (c !== undefined) {
      if (this.shouldLog('debug')) {
        console.debug(`[DEBUG] [${a}:${String(b)}] ${c}`, d);
        this.pushLog('debug', a, String(b), c, d);
      }
    } else {
      if (this.shouldLog('debug')) {
        console.debug(`[DEBUG] ${a}`, b);
        this.pushLog('debug', 'app', 'general', a, typeof b === 'object' ? (b as any) : undefined);
      }
    }
  }

  critical(
    category: string,
    component: string,
    message: string,
    context?: Record<string, unknown>,
    stack?: string,
  ) {
    console.error(`[CRITICAL] [${category}:${component}] ${message}`, context, stack);
    this.pushLog('error', category, component, message, context, stack);
  }

  logUIError(component: string, error: Error, context?: Record<string, unknown>) {
    const entryContext = { message: error.message, stack: error.stack, ...context };
    console.error(`[UI_ERROR] [${component}]`, entryContext);
    this.pushLog('error', 'ui', component, error.message, context, error.stack);
  }

  logPerformance(metric: string, value: number, context?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      console.info(`[PERFORMANCE] ${metric}: ${value}`, context);
      this.pushLog('info', 'performance', metric, String(value), context);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs].sort((a, b) => b.timestamp - a.timestamp);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getLogStats(): LogStats {
    const byLevel: Record<LogLevel, number> = {
      critical: 0,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
    } as any;
    const byCategory: Record<string, number> = {};
    let lastError: LogEntry | undefined;
    const since = Date.now() - 24 * 60 * 60 * 1000;
    let errorCount24h = 0;
    for (const l of this.logs) {
      byLevel[l.level]++;
      byCategory[l.category] = (byCategory[l.category] || 0) + 1;
      if (
        (l.level === 'error' || l.level === 'critical') &&
        (!lastError || l.timestamp > lastError.timestamp)
      ) {
        lastError = l;
      }
      if ((l.level === 'error' || l.level === 'critical') && l.timestamp >= since) {
        errorCount24h++;
      }
    }
    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      errorCount24h,
      lastError: lastError ? { timestamp: lastError.timestamp, message: lastError.message } : null,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private pushLog(
    level: LogLevel,
    category: string,
    component: string,
    message: string,
    context?: Record<string, unknown>,
    stack?: string,
  ) {
    this.logs.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      level,
      category,
      component,
      message,
      timestamp: Date.now(),
      context,
      stack,
    });
  }
}

const loggingService = new LoggingService();
export default loggingService;
