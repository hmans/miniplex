export function memoizedMap<T>() {
  const map: Record<any, any> = {}

  function fetch(key: any, defaultFun?: () => T): T {
    const memoKey = JSON.stringify(key)
    if (!map[memoKey] && defaultFun) map[memoKey] = defaultFun()
    return map[memoKey]
  }

  return { fetch }
}
