export type PaginationParams = {
  skipCount: number;
  maxResultCount: number;
};

export type PagedResultDto<T> = {
  items: T[];
  totalCount: number;
};
