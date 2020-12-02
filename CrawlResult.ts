import {ICrawlResult, CrawlResultStates, ICrawlDefinition} from "./CrawlerAbstractions";

export class CrawlResult implements ICrawlResult {
  private constructor(public crawlName: string, public status: CrawlResultStates, public error?: any) {
  }

  static Success(definition: ICrawlDefinition<any>) {
    return new CrawlResult(definition.crawlName, CrawlResultStates.Success);
  }

  static Failure(definition: ICrawlDefinition<any>, error: Error) {
    return new CrawlResult(definition.crawlName, CrawlResultStates.Failure, error);
  }
}
