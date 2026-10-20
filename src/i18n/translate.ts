import type { TranslationSchema } from './en'

type Path = string

function getByPath(obj: TranslationSchema, path: Path): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || typeof current !== 'object' || !(key in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

export function translate(
  messages: TranslationSchema,
  path: Path,
  vars?: Record<string, string | number>,
): string {
  let text = getByPath(messages, path) ?? path
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${key}}`, String(value))
    }
  }
  return text
}
