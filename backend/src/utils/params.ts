export function getParam(param: any): string {
  if (Array.isArray(param)) return param[0];
  if (typeof param === 'string') return param;
  return param ? String(param) : '';
}
