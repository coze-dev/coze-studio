const log = {
  info: vi.fn().mockImplementation(console.log.bind(console, '[info]')),
  error: vi.fn().mockImplementation(console.error.bind(console, '[error]')),
  success: vi.fn().mockImplementation(console.log.bind(console, '[success]')),
};

vi.mock('@coze-arch/logger', () => ({
  logger: {
    ...log,
    persist: log,
  },
  reporter: {
    createReporterWithPreset: vi
      .fn()
      .mockReturnValue({ tracer: vi.fn().mockReturnValue({ trace: vi.fn() }) }),
  },
}));
