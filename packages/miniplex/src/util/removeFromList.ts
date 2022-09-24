export function removeFromList<T>(list: T[], item: T) {
  const pos = list.indexOf(item, 0)

  if (pos >= 0) {
    list[pos] = list[list.length - 1]
    list.pop()
  }
}
