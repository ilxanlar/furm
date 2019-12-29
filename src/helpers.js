export function get(obj, path, defaultValue) {
  let result = String.prototype.split.call(path, /[,[\].]+?/)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined) ? res[key] : res, obj);
  return (result === undefined || result === obj) ? defaultValue : result;
}

export function set(obj, path, value) {
  if (Object(obj) !== obj) {
    return obj;
  }
  if (!Array.isArray(path)) {
    path = path.toString()
      .match(/[^.[\]]+/g) || [];
  }
  path.slice(0, -1)
    .reduce((a, c, i) => Object(a[c]) === a[c] ? a[c] : a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}, obj)[path[path.length - 1]] = value;
  return obj;
}

export function clone(data) {
  return data ? { ...data } : data;
}
