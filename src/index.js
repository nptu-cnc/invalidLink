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
    maxConcurrency: 3,
    timeout: 5000,
    monitor: false,
    puppeteerOptions:{
      headless:true
    }
  });




  await cluster.task(async ({ page, data: { url = "", layer = 0, from = "", root = "" } }) => {

    await page.goto(url, { waitUntil: "networkidle2" });


    let dataDic ={};
    dataDic = await classify(url, await getInfo(page), root);
    queue.push(url);
    
    await page.close();

    checkURL(dataDic.exteralLink.href, dataDic.exteralLink.content, url);
    checkURL(dataDic.interalLink.href, dataDic.interalLink.content, url);
    checkURL(dataDic.img,[], url);

    console.log(`Layer${layer} -> ${url} \nFrom -> ${from}\n` );
    layer = layer - 1;

    if (layer == 0) return;

    for (let i of dataDic.interalLink.href) {
      for (let j of queue) {
        if (i != j) {
          await cluster.queue({ url: i, layer: layer, from: url, root });
        }
      }
    }
    
    
  });


  await cluster.queue({ url: 'https://cnc.nptu.edu.tw/', layer: 2, from:"https://cnc.nptu.edu.tw/", root: 'https://cnc.nptu.edu.tw/' });


  // many more pages

  await cluster.idle();
  await cluster.close();

})();














async function getInfo(page) {
  
  let rtn = await page.evaluate(() => {
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
  return rtn;
}