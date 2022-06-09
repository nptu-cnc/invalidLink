import checkURL from "./checkURL.js";
import { Cluster } from "puppeteer-cluster";
import classify from './classify.js'


let output = [['URL Source', 'URL', 'Title',"Content", 'Status', 'Redirect code']];

let queue = [];
let error = [];




let index = 0;
(async () => {

  let cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
    timeout: 5000,
    monitor: false,
  });




  await cluster.task(async ({ page, data: { url = "", layer = 0, from = "", root = "" } }) => {
    await page.goto(url, { waitUntil: "networkidle2" });

    let data = await classify(url, await getInfo(page), root);

    console.log(data.exteralLink)
    queue.push(url);

    page.close();
    checkURL(data.exteralLink.href, data.exteralLink.title, from);
    checkURL(data.interalLink.href, data.interalLink.title, from);
    checkURL(data.img,[], from);
    //console.log(`Layer${layer} -> ${url} \nFrom -> ${from}`);
    layer = layer - 1;

    if (layer == 0) return;
    console.log("Hi")
    for (let i of data.interalLink.href) {
      for (let j of queue) {
        if (i != j) {
          cluster.queue({ url: i, layer: layer, from: url, root });

        }
      }
    }

  });


  cluster.queue({ url: 'https://www.nptu.edu.tw/', layer: 2, root: 'https://www.nptu.edu.tw/' });


  // many more pages

  await cluster.idle();
  await cluster.close();
  for (let i of error) {
    console.log(i);
  }
})();














async function getInfo(page) {
  return await page.evaluate(() => {
    let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'));
    let titleA = Array.from(document.querySelectorAll('a'), a => a.getAttribute('title'));
    let content = Array.from(document.querySelectorAll('a'), a => String(a.textContent).trim());
    let img = Array.from(document.querySelectorAll('img'), img => img.src)
    let titleIMG = Array.from(document.querySelectorAll('img'), img => img.title)
    return {
      "href": href,
      "content": content,
      'img': img,
      "titleA": titleA,
      "titleIMG": titleIMG
    }
  });
}