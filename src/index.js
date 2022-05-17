import { link } from "fs";
import axios from "axios";
import { Cluster } from "puppeteer-cluster";

let output={}


let cluster = Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 10,
});

async function checkLayer2(originUrl='',urlArray=[]){
  let cluster2 = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  await cluster2.task(async ({ page, data: url }) => {
    await page.goto(url);
    let data2 = await page.evaluate(() => {
      let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'));
      let content = Array.from(document.querySelectorAll('a'), a => a.textContent);
      return { "href": href, "title": content }
    });
    let data = await classify(url, data2);
    
    for(let i of data.interalLink.href){
      await checkURL(i,url);
    }




  });
  
}

async function classify(url = "", data = { "href": [], "title": [] }) {
  let totalLink = { "href": [], "title": [] }
  let exteralLink = { "href": [], "title": [] };
  let interalLink = { "href": [], "title": [] };

  if (url.endsWith("/", url.length)) {
    url = url.substring(0, url.length - 1);
  }
  for (let i in data.href) {
    
    if (String(data.href[i]).startsWith('/index.php')) continue;

    if (!data.href[i]) continue;
    
    if(data.href[i].includes('#'))continue;

    if (!data.href[i].includes(url)) {
      
        if (data.href[i].startsWith('/', 0)) {
          data.href[i] = data.href[i].replace('/', url + '/')
        }
      
    }

    if (data.href[i].startsWith(url, 0)) {
      interalLink.href.push(data.href[i]);
      interalLink.title.push(data.title[i]);
    }
    else {
      exteralLink.href.push(data.href[i]);
      exteralLink.title.push(data.title[i]);
    }
    totalLink.href.push(data.href[i]);
    totalLink.title.push(data.title[i]);
  }

  return { interalLink, exteralLink,totalLink}

}

async function checkURL(url="",orgURL){
  
  let resp = await axios.get(url,{beforeRedirect:()=>{

  }});

  console.log(`${url} : `,resp.status)
  
}

(async () => {

  cluster = await cluster;
  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    let data2 = await page.evaluate(() => {
      let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'));
      let content = Array.from(document.querySelectorAll('a'), a => a.textContent);
      return { "href": href, "title": content }
    });
    let data = await classify(url, data2);
    //console.log(data.exteralLink.href);

    for(let i of data.interalLink.href){
      checkURL(i,url);
      
    }




  });


  cluster.queue('https://www.nptu.edu.tw/');


  // many more pages

  await cluster.idle();
  await cluster.close();
})();