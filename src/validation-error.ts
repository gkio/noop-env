export class ValidationError extends Error {
  private fieldErrors: Map<string, string>;

  constructor(message: string, fieldErrors: Map<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
    Error.captureStackTrace(this, this.constructor);
  }

  getFieldError(): Map<string, string> {
    return this.fieldErrors;
  }
}
