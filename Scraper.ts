import * as puppeteer from 'puppeteer';

const url = "https://www.asias.faa.gov/apex/f?p=100:96:28973566159462::::P96_ENTRY_DATE,P96_FATAL_FLG,P96_MAKE_NAME:17-NOV-20";

export class Crawler {
  constructor(private url: string) {

  }

  crawl() {
    (async () => {
      await this.execute();
    })();
  }
  
  private async execute() {
    console.log("running")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(this.url);
    const t = await page.evaluate((sel) => {
      console.log(sel);
      const labels = Array.from(document.querySelectorAll(".listtable #td_shade")).map(e => e.textContent.replace("\n","").replace(" ", "_"));
      const values = Array.from(document.querySelectorAll(".listtable #td_noshade")).map(e => e.textContent.replace("\n",""));
      return labels
      .map((v, i) => [v,i])
      .reduce((acc, [v,i]) => {
        acc[v] = values[i];
        return acc;
      }, {});
    });
    console.log(t);
    browser.close();
  }
}
console.log("started")

new Crawler(url).crawl();