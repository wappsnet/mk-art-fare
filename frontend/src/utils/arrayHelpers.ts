/**
 * Adds a unique `_key` property to each item in an array based on auto-incremented counter.
 * This is useful for React keys when array items don't have unique identifiers.
 *
 * For primitive types (string, number), wraps them in an object with `value` and `_key` properties.
 * For objects, adds `_key` property directly.
 *
 * @param items - Array of items to add keys to
 * @returns Array with _key property added to each item
 */
let keyCounter = 0;

type ItemWithKey<T> = T extends object ? T & { _key: string } : { value: T; _key: string };

export function withKeys<T>(items: T[]): Array<ItemWithKey<T>> {
  return items.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return {
        ...(item as object),
        _key: `item-${keyCounter++}`,
      } as ItemWithKey<T>;
    }
    return {
      value: item,
      _key: `item-${keyCounter++}`,
    } as ItemWithKey<T>;
  }) as Array<ItemWithKey<T>>;
}

/**
 * Resets the key counter. Useful for testing or when you want to restart numbering.
 */
export function resetKeyCounter() {
  keyCounter = 0;
}
