// Jest setup file para manejar mocks de Expo
// Este archivo resuelve el problema con 'expo/src/async-require/messageSocket'

// Mock para expo/src/async-require/messageSocket
jest.mock(
  "expo/src/async-require/messageSocket",
  () => ({
    default: {
      send: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    },
  }),
  { virtual: true }
);

// Mock adicional para react-native/Libraries/Core/Devtools/getDevServer
jest.mock(
  "react-native/Libraries/Core/Devtools/getDevServer",
  () => ({
    getDevServer: jest.fn(() => ({
      url: "http://localhost:8081",
      bundleLoadedFromServer: true,
    })),
  }),
  { virtual: true }
);

// Mock para console.warn para evitar warnings en los tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Mock para expo/fetch
jest.mock("expo/fetch", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({})),
      text: jest.fn(() => Promise.resolve("")),
    })
  ),
}));

// Mock para expo/src/winter/runtime.native.ts - debe estar antes de cualquier import de Expo
jest.mock("expo/src/winter/runtime.native.ts", () => ({}), { virtual: true });

// Mock para expo/src/winter/installGlobal.ts que usa runtime.native
jest.mock("expo/src/winter/installGlobal.ts", () => ({
  installGlobal: jest.fn(),
}), { virtual: true });

// Mock para APIs globales que Expo winter runtime necesita
if (typeof global.TextDecoderStream === "undefined") {
  global.TextDecoderStream = class TextDecoderStream {
    constructor() {}
    readable = {};
    writable = {};
  };
}

if (typeof global.TextEncoderStream === "undefined") {
  global.TextEncoderStream = class TextEncoderStream {
    constructor() {}
    readable = {};
    writable = {};
  };
}
