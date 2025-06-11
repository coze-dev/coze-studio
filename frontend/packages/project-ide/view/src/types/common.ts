export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
