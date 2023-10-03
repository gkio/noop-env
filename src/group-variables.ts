import { camelCase } from './utils/camel-case.js'

import type { Group } from './group.js'

export function groupVariables<
  TInput extends object,
  TOutput = Group<TInput, '.'>,
>(input: TInput, groupBy = '.'): TOutput {
  return Object.entries(input).reduce((output: TOutput, [key, value]) => {
    key
      .split(groupBy)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((target: any, part: string, index: number, parts: string[]) => {
        const camelCasedPart = camelCase(part) as keyof TOutput
        if (index === parts.length - 1) {
          target[camelCasedPart] = value
        } else {
          target[camelCasedPart] = target[camelCasedPart] || {}
        }
        return target[camelCasedPart]
      }, output)
    return output
  }, {} as TOutput)
}
