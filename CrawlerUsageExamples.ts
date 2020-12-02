import {CrawlBuilder} from './CrawlBuilder';
import {ICrawlDefinition, ICrawler} from './CrawlerAbstractions';

function runCrawler(crawler: ICrawler) {
  return (async () => {
    return crawler.crawl();
  })();
}

//  a dummy modelf or our example
type ReportCrawlModel = { [key: string]: any };

// a url to call with some report ata
const url = "https://www.asias.faa.gov/apex/f?p=100:96:28973566159462::::P96_ENTRY_DATE,P96_FATAL_FLG,P96_MAKE_NAME:17-NOV-20";

// an object fully defining a report crawl
const reportCrawl = <ICrawlDefinition<ReportCrawlModel>>{
  crawlName: "report crawl",
  expression: () => {
    const labels = Array.from(document.querySelectorAll(".listtable #td_shade")).map(e => e.textContent.replace("\n", "").replace(" ", "_") ?? "No value detected");
    const values = Array.from(document.querySelectorAll(".listtable #td_noshade"))
      .map(e => e?.textContent.replace("\n", ""));
    return labels
      .map((v, i) => [v, i] as [string, number])
      .reduce((acc, [v, i]) => {
        acc[v] = values[i];
        return acc;
      }, <ReportCrawlModel>{});
  },
  finalize: async (r) => console.log(`finalizing ${JSON.stringify(r)}`)
};

// example usage of builder, configuring two separate jobs on the same url
const oneDefinitionCrawler = CrawlBuilder.create(url)
   // add crawl using arguments
  .addCrawl("report crawl from arguments", reportCrawl.expression, reportCrawl.finalize)
   // add second crawl using definition object
  .addCrawlDefinition(reportCrawl)
  .build();

// simple crawler runner function so we don't need a wrapper class.
// In practice this would likely be handled subordinate to a runtime
runCrawler(oneDefinitionCrawler).then(console.log);
