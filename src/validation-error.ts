type FieldErrors = Record<string, string>

export class ValidationError extends Error {
  private readonly fieldErrors: FieldErrors

  constructor(message: string, fieldErrors: FieldErrors) {
    super(message)
    this.fieldErrors = fieldErrors
    Error.captureStackTrace(this, this.constructor)
  }

  getFieldError(): FieldErrors {
    return this.fieldErrors
  }
}
