type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

/**
 * Loga mensagens em um formato JSON estruturado.
 * Isso permite buscas e filtros fáceis no CloudWatch.
 *
 * Ex: logger.info("Usuário logado", { userId: "123" })
 */
class Logger {
  private log(level: LogLevel, message: string, context: object = {}) {
    // Em produção, não queremos logar 'DEBUG'
    if (level === "DEBUG" && process.env.IS_OFFLINE !== "true") {
      return;
    }

    const logEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
    };

    // Imprime a string JSON para o CloudWatch
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, context?: object) {
    this.log("INFO", message, context);
  }

  warn(message: string, context?: object) {
    this.log("WARN", message, context);
  }

  /**
   * Loga um erro, garantindo que o stack trace seja incluído.
   */
  error(message: string, error: Error, context: object = {}) {
    const errorContext = {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };
    this.log("ERROR", message, errorContext);
  }

  debug(message: string, context?: object) {
    this.log("DEBUG", message, context);
  }
}

export const logger = new Logger();
