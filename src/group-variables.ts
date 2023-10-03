import { camelCase } from './utils/camel-case.js'

interface GroupedObject {
  [key: string]: string | GroupedObject
}

export function groupVariables<
  TInput extends object,
  TOutput extends GroupedObject,
>(input: TInput, groupBy = '.'): TOutput {
  return Object.entries(input).reduce((output, [key, value]) => {
    key
      .split(groupBy)
      .reduce(
        (
          target: GroupedObject,
          part: string,
          index: number,
          parts: string[],
        ) => {
          const camelCasedPart = camelCase(part)
          if (index === parts.length - 1) {
            target[camelCasedPart] = value as string
          } else {
            target[camelCasedPart] = target[camelCasedPart] || {}
          }
          return target[camelCasedPart] as GroupedObject
        },
        output,
      )
    return output
  }, {} as TOutput)
}
