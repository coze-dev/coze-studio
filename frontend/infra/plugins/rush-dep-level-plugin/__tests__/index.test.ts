import type {
  RushConfiguration,
  RushConfigurationProject as RushProject,
  RushSession,
} from '@rushstack/rush-sdk';

import RushDepLevelPlugin from '../src';

// Mock logger
vi.mock('@coze-arch/rush-logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Create mock projects helper function
const createMockProject = (
  name: string,
  tags: string[],
  deps: RushProject[] = [],
): RushProject =>
  ({
    packageName: name,
    tags: new Set(tags),
    dependencyProjects: new Set(deps),
  }) as unknown as RushProject;

describe('RushDepLevelPlugin', () => {
  let mockExit;
  let plugin: RushDepLevelPlugin;
  let mockRushSession: RushSession;
  let mockRushConfiguration: RushConfiguration;

  beforeEach(() => {
    // Mock process.exit
    mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process.exit called with code: ${code}`);
    });

    // Create plugin instance
    plugin = new RushDepLevelPlugin();

    // Mock RushSession
    mockRushSession = {
      hooks: {
        beforeInstall: {
          tap: vi.fn((name: string, callback: () => void) => callback()),
        },
      },
    } as unknown as RushSession;

    // Mock RushConfiguration
    mockRushConfiguration = {
      projects: [],
    } as unknown as RushConfiguration;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass validation when all projects have valid level tags', () => {
    const projectA = createMockProject('project-a', ['level-2']);
    const projectB = createMockProject('project-b', ['level-1']);
    //@ts-expect-error -- mock
    mockRushConfiguration.projects = [projectA, projectB];
    //@ts-expect-error -- mock
    projectA.dependencyProjects = new Set([projectB]);

    expect(() => {
      plugin.apply(mockRushSession, mockRushConfiguration);
    }).not.toThrow();
  });

  it('should throw error when project has no level tag', () => {
    const projectA = createMockProject('project-a', []);
    //@ts-expect-error -- mock
    mockRushConfiguration.projects = [projectA];

    expect(() => {
      plugin.apply(mockRushSession, mockRushConfiguration);
    }).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should throw error when dependency has invalid level', () => {
    const projectB = createMockProject('project-b', ['level-2']);
    const projectA = createMockProject('project-a', ['level-1'], [projectB]);
    //@ts-expect-error -- mock
    mockRushConfiguration.projects = [projectA, projectB];

    expect(() => {
      plugin.apply(mockRushSession, mockRushConfiguration);
    }).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
