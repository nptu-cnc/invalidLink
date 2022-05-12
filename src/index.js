import { Cluster } from "puppeteer-cluster";

async function classify(url = "", data = { "href": [], "title": [] }) {
  let exteralLink = [];
  let interalLink = [];
  
  if (url.endsWith("/", url.length)) {
    url = url.substring(0, url.length - 1);
  }
  
  data.href.forEach( (i,index)=>{
    if (!i.includes(url)) {
      let u = ["/app", "/p", "/var", "/index.php"];
      for (let j of u) {

        if (i.startsWith(j, 0)) {
          i = i.replace(j, url + j)
        }
      }
    }
    if (i.startsWith(url, 0)) {
      console.log(i)
      interalLink.push(i);
    }
    else {
      exteralLink.push(i);
    }
  });
  

}


(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    const screen = await page.screenshot();
    let data = await page.evaluate(() => {
      let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'));
      let content = Array.from(document.querySelectorAll('a'), a => a.textContent);
      return {"href": href,"title": content}
    });

    //classify(url, data);

  });


  cluster.queue('https://www.nptu.edu.tw/');
  //cluster.queue('http://www.wikipedia.org/');
  // many more pages

  await cluster.idle();
  await cluster.close();
})();