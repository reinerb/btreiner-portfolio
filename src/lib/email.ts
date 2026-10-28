/** Writes every character as a numeric HTML entity, e.g. "h" becomes "&#104;". */
export function entityEncode(text: string): string {
  return Array.from(text, (char) => `&#${char.codePointAt(0)};`).join('');
}

/**
 * Returns an HTML string for a mailto link with the address entity-encoded.
 * Insert it with set:html: a normal href={...} would escape the "&" in each
 * entity and undo the encoding. With no label, the link text is the encoded address.
 */
export function mailtoLink(address: string, label?: string): string {
  const text = label ?? entityEncode(address);
  return `<a href="${entityEncode(`mailto:${address}`)}">${text}</a>`;
}
