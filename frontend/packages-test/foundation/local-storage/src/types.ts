export interface LocalStorageCacheConfig {
  bindAccount?: boolean;
}

export interface CacheDataItems {
  [key: string]: string;
}

export interface LocalStorageCacheData {
  permanent?: CacheDataItems;
  userRelated?: Record<string, CacheDataItems>;
}
