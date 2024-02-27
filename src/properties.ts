export function get(elem: HTMLElement, prop: string) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
}

export function set(elem: HTMLElement, prop: string, value: string | null) {
  elem.style.setProperty(prop, value);
}

export function increase(elem: HTMLElement, prop: string, delta: number) {
  set(elem, prop, get(elem, prop) + delta + '');
}
