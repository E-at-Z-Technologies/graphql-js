export function toObjMap(obj) {
  if (Object.getPrototypeOf(obj) === null) {
    return obj;
  }

  const map = Object.create(null);

  for (const [key, value] of Object.entries(obj)) {
    map[key] = value;
  }

  return map;
}
