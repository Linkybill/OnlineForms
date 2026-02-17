export interface IPageLoader {
  initialize(nextRef: string | undefined): void;
  loadNextPage(): Promise<void>;
  loadPreviousPage(): Promise<void>;
  hasNext(): boolean;
  hasPrevious(): boolean;
}
