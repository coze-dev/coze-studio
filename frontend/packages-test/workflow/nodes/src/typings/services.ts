export const DeveloperApiService = Symbol('DeveloperAPIService');

export interface DeveloperApiService {
  GetReleasedWorkflows: (req?: unknown) => Promise<{ data: any }>;
}
