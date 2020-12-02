export type CrawlExpression<T> = () => T;
export type CrawlFinalizer<T> = (data: T) => Promise<void>;

export interface ICrawlDefinition<T> {
  readonly crawlName: string;
  readonly expression: CrawlExpression<T>;
  readonly finalize: CrawlFinalizer<T>;
}

export interface ICrawler {
  crawl(): Promise<ICrawlResult[]>;
}

export enum CrawlResultStates {
  Success = "Success",
  Failure = "Failure"
}

export interface ICrawlResult {
  readonly crawlName: string;
  readonly status: CrawlResultStates;
  readonly error?: any;
}
