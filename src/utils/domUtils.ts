// utils/domUtils.ts
export function createElement(tag: string, className: string, textContent?: string): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}