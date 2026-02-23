/**
 * Logging utilities
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  enableTimestamp?: boolean;
}

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig;

  private static LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      prefix: '[AgentSDK]',
      enableTimestamp: true,
      ...config,
    };
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Get log level
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Check if a level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVELS[level] >= Logger.LEVELS[this.config.level];
  }

  /**
   * Format message
   */
  private format(level: LogLevel, message: string, ...args: unknown[]): string {
    const parts: string[] = [];

    if (this.config.enableTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(this.config.prefix || '');
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    let formatted = parts.join(' ');

    if (args.length > 0) {
      const argString = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');
      formatted += ` ${argString}`;
    }

    return formatted;
  }

  /**
   * Debug log
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, ...args));
    }
  }

  /**
   * Info log
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, ...args));
    }
  }

  /**
   * Warning log
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, ...args));
    }
  }

  /**
   * Error log
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, ...args));
    }
  }

  /**
   * Log with specific level
   */
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
    }
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger();

/**
 * Create a new logger
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}