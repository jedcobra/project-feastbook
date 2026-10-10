// Applies an owner's saved cookbook arrangement. Anything they haven't
// placed yet (added or saved since they last rearranged) goes first, in
// its existing order, so new recipes show up at the top instead of being
// buried below an old arrangement.
export function sortByCookbookOrder<T>(items: T[], getId: (item: T) => string, order: string[]): T[] {
  const position = new Map(order.map((id, i) => [id, i]));
  const unplaced = items.filter((item) => !position.has(getId(item)));
  const placed = items
    .filter((item) => position.has(getId(item)))
    .sort((a, b) => position.get(getId(a))! - position.get(getId(b))!);
  return [...unplaced, ...placed];
}

// Moves the item at `from` to `to`, shifting everything between.
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
