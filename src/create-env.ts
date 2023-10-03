import { groupVariables } from './group-variables.js'
import { ValidationError } from './validation-error.js'

import type { z } from 'zod'
import type { Group } from './group.js'

export function createEnv<
  TInput,
  TOutput extends object,
  TGroupedOutput = Group<TOutput>,
>(
  processEnv: NodeJS.ProcessEnv | Record<string, unknown>,
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>,
): TGroupedOutput {
  const result = schema.safeParse(processEnv)

  if (result.success) {
    return groupVariables(result.data, '.')
  }

  handleValidationErrors(result.error.errors)
}

function handleValidationErrors(errors: z.ZodError['errors']): never {
  const affectedVariables: string[] = []
  const fieldErrors: Map<string, string> = new Map()

  errors.forEach((error) => {
    const fieldName = error.path[0] as string
    affectedVariables.push(fieldName)
    fieldErrors.set(fieldName, generateErrorMessage(fieldName, error))
  })

  throw new ValidationError(
    `Validation of the following environment variables failed: "${affectedVariables.join(
      '", "',
    )}"`,
    fieldErrors,
  )
}

function generateErrorMessage(fieldName: string, error: z.ZodIssue): string {
  let errorMessage = `Unknown error for variable "${fieldName}"`

  switch (error.code) {
    case 'invalid_type':
      errorMessage =
        error.received === 'undefined'
          ? `Missing variable: The variable "${fieldName}" is required, but missing`
          : `The value of variable "${fieldName}" must be of type "${error.expected}", but received "${error.received}"`
      break
    case 'invalid_enum_value':
      errorMessage = `Enum mismatch: The variable "${fieldName}" must be one of the following values: "${error.options.join(
        '", "',
      )}", but received "${error.received}"`
      break
    case 'invalid_string':
      errorMessage = generateStringErrorMessage(fieldName, error)
      break
  }

  return errorMessage
}

function generateStringErrorMessage(
  fieldName: string,
  error: z.ZodInvalidStringIssue,
): string {
  if (typeof error.validation === 'string') {
    return `Format error: The value of variable "${fieldName}" must be a valid ${error.validation}`
  }
  if ('startsWith' in error.validation) {
    return `Format error: The value of variable "${fieldName}" must start with ${error.validation.startsWith}`
  }
  if ('endsWith' in error.validation) {
    return `Format error: The value of variable "${fieldName}" must end with ${error.validation.endsWith}`
  }
  return `Format error: The value of variable "${fieldName}" must include "${
    error.validation.includes
  }"${
    error.validation.position ? ` at position ${error.validation.position}` : ''
  }`
}
