type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.isProduction) {
      // In production, we could send logs to a service like Sentry, Logtail, or Datadog
      if (level === 'error') {
        console.error(formattedMessage, data);
      } else if (level === 'warn') {
        console.warn(formattedMessage, data);
      }
      // Info/Debug might be suppressed or sent to a lower-priority stream
    } else {
      console[level](formattedMessage, data);
    }
  }

  info(message: string, data?: any) { this.log('info', message, data); }
  warn(message: string, data?: any) { this.log('warn', message, data); }
  error(message: string, data?: any) { this.log('error', message, data); }
  debug(message: string, data?: any) { this.log('debug', message, data); }
}

export const logger = new Logger();
