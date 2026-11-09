import "@testing-library/jest-dom"

declare global {
  // Vitest adds these to the global scope.
  // We re-declare them here to silence TS errors in setup files.
  var vi: typeof import("vitest")
  var beforeEach: typeof import("vitest").beforeEach
  var afterEach: typeof import("vitest").afterEach
  var describe: typeof import("vitest").describe
  var it: typeof import("vitest").it
  var expect: typeof import("vitest").expect
}

export {}
