// Resolve as the browser does; a leading slash alone does not imply locality.
export function isSameOriginReference(value, base) {
  try {
    const resolved = new URL(value, base);
    return ['http:', 'https:'].includes(resolved.protocol) &&
      resolved.origin === new URL(base).origin &&
      resolved.username === '' && resolved.password === '';
  } catch {
    return false;
  }
}
