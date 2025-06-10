import '@testing-library/jest-dom/vitest';

vi.stubGlobal('AudioWorkletNode', vi.fn());
vi.stubGlobal('SAMI_WS_ORIGIN', vi.fn());
vi.stubGlobal('SAMI_APP_KEY', vi.fn());
vi.stubGlobal('IS_DEV_MODE', false);
