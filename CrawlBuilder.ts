import * as puppeteer from 'puppeteer';
import {CrawlResult} from './CrawlResult';
import {ICrawlDefinition, CrawlExpression, CrawlFinalizer, ICrawler} from "./CrawlerAbstractions";


/**
 * Provides support for configuring multiple sequential extractions for a single url.
 *
 * Cannot be reused across multiple domains, but can rerun as many times as it needs to.
 *
 * Creates a new browser instance per job. Future plans to add the ability to run multiple
 * expressions as steps without collecting the browser instance.
 */
export class CrawlBuilder {
  private readonly crawlDefinitions: Array<ICrawlDefinition<any>> = [];

  private constructor(private url: string) {
  }

  public static create(url: string): CrawlBuilder {
    return new CrawlBuilder(url);
  }

  /**
   * Accepts a definition object which defines the operations and identity for a crawl.
   * Can be called as many times as you want for a given url
   * @param definition
   * A job definition object for a given crawl
   */
  addCrawlDefinition<T>(definition: ICrawlDefinition<T>): CrawlBuilder {
    this.crawlDefinitions.push(definition);
    return this;
  }

  /**
   * Accepts all parameters of an ICrawlDefinition individually as arguments
   * Can be used to configuure adhoc jobs
   * @param crawlName
   * Identity of the crawl in question
   * @param expr
   * Expression to serve as the process invocation. Should expect access to a 'document' object
   * that will be bound by the browser
   * @param finalizer
   * The method which will run after the expression succeeds. Can be used to save the results
   * of a given expression's execution. Can be set to async noop
   */
  addCrawl<T>(crawlName: string, expr: CrawlExpression<T>, finalizer: CrawlFinalizer<T>): CrawlBuilder {
    if (!crawlName || !expr || !finalizer) {
      throw new Error("All crawl parameters must be satisfied");
    }
    this.crawlDefinitions.push({
      crawlName: crawlName,
      expression: expr,
      finalize: finalizer
    });
    return this;
  }

  /**
   * Initializes the browser for a given run, navigates the window to its target location
   * Returns a Promise which resolves to a tuple contianing the browser and the page
   * @param url
   */
  private readonly bootstrapBrowser = async (url: string): Promise<[puppeteer.Browser, puppeteer.Page]> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return [browser, page];
  };

  /**
   * Produces a bound instance of an ICrawler. This exposes the crawl method
   * All operations are lazy invocation.
   */
  build() {
    return <ICrawler>{
      crawl: ((definitions: ICrawlDefinition<any>[], url: string) => async () => {
        return await Promise.all(definitions.map((definition) => (async () => {
          let crawlResult = null;
          const [browser, page] = await this.bootstrapBrowser(url);
          try {
            const result = await page.evaluate(definition.expression);
            definition.finalize(result);
            crawlResult = CrawlResult.Success(definition);
          } catch (ex) {
            console.log(ex);
            crawlResult = CrawlResult.Failure(definition, ex);
          } finally {
            await browser.close();
          }
          return crawlResult;
        })()));
      })(this.crawlDefinitions, this.url)
    };
  }
}
