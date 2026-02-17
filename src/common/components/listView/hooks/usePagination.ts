import { useRef } from "react";
import { PagedResult } from "../models/PagedResult";
import { IPageLoader } from "../interfaces/IPageLoader";

export function usePagination(
  loadPage: (url: string) => Promise<PagedResult>,
  onPageLoaded: (result: PagedResult) => void
): IPageLoader {
  const currentPage = useRef<string>("");
  const previousPages = useRef<string[]>([]);
  const nextPage = useRef<string | undefined>(undefined);

  return {
    initialize: (nextUrl: string | undefined): void => {
      previousPages.current = [];
      currentPage.current = "";
      nextPage.current = nextUrl;
    },
    loadNextPage: async (): Promise<void> => {
      const result = await loadPage(nextPage.current ? nextPage.current : "");
      previousPages.current.push(currentPage.current);
      currentPage.current = nextPage.current ? nextPage.current : "";
      nextPage.current = result.nextRef;
      onPageLoaded(result);
    },
    async loadPreviousPage(): Promise<void> {
      nextPage.current = currentPage.current;
      const tmpCurrent = previousPages.current.pop();
      currentPage.current = tmpCurrent ? tmpCurrent : "";
      const result = await loadPage(currentPage.current);
      onPageLoaded(result);
    },
    hasNext(): boolean {
      return nextPage.current !== undefined;
    },
    hasPrevious(): boolean {
      return previousPages.current.length > 0;
    },
  };
}
