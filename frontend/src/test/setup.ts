import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia; Ant Design's responsive breakpoint
// observer (used by Grid/Form layout internals) calls it on mount, so every
// antd-rendered test needs this stub in place.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom doesn't implement ResizeObserver either; Ant Design's Select (and
// other overlay-positioned components) observe their trigger element's size
// via rc-resize-observer, which throws on mount without this stub -- needed
// starting with C-16's Select usage in MenuManager/TableLayoutEditor.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(() => {
  cleanup()
})
