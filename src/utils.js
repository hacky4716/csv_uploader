// helpers for nested keys
export function setNested(obj, pathArray, value) {
  let cur = obj;
  for (let i = 0; i < pathArray.length; i++) {
    const k = pathArray[i];
    if (i === pathArray.length - 1) {
      cur[k] = value;
    } else {
      if (!Object.prototype.hasOwnProperty.call(cur, k) || typeof cur[k] !== 'object' || cur[k] === null) {
        cur[k] = {};
      }
      cur = cur[k];
    }
  }
}


export function buildNestedFromHeaders(headers, values) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i].trim();
    const raw = values[i] === undefined ? '' : values[i].trim();
    const val = raw === '' ? null : raw;
    const parts = key.split('.');
    setNested(obj, parts, val);
  }
  return obj;
}