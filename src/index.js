import fs from "fs";
import axios from "axios";
import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer";


let output = [['URL Source', 'URL', 'Title', 'Status', 'Redirect code']];

let queue = [];
let error = [];
let rediect = []


let cluster = Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 50,
  timeout:5000,
  monitor:true
});

async function classify(url = "", data = { "href": [], "title": [], 'img': [] }, root = "") {

  let img = data.img;
  let exteralLink = { "href": [], "title": [] };
  let interalLink = { "href": [], "title": [] };

  if (url.endsWith("/", url.length)) {
    url = url.substring(0, url.length - 1);
  }
  if (root.endsWith("/", root.length)) {
    root = root.substring(0, root.length - 1);
  }
  for (let i in data.href) {

    if (String(data.href[i]).startsWith('/index.php')) continue;

    if (!data.href[i]) continue;

    if (data.href[i].includes('#')) continue;

    if (!data.href[i].includes(url)) {

      if (data.href[i].startsWith('/', 0)) {
        data.href[i] = data.href[i].replace('/', root + '/')
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
  }

  return { interalLink, exteralLink, img }

}

async function checkURL(url = [], title = [], from = "") {

  let resp;
  let statusCode = 0;
  for (let i of url) {

    try {
      resp = await axios.get(i);
      statusCode = resp.status;
    }
    catch (err) {
      statusCode = err['response'].status;
      if (statusCode > 400) {
        error.push({ i, statusCode, from });
       
        console.log("----------------------------------");
        console.log("URL : ", i)
        console.log(`Status : `, statusCode);
        console.log(`From : `, from);
        console.log("----------------------------------");
 
      }
    }

    console.log("----------------------------------");
    console.log("URL : ", i)
    console.log(`Status : `, statusCode);
    console.log(`From : `, from);
    console.log("----------------------------------");


  }
  return;

}

async function getInfo(page) {
  return await page.evaluate(() => {
    let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'));
    let content = Array.from(document.querySelectorAll('a'), a => String(a.textContent).trim());
    let img = Array.from(document.querySelectorAll('img'), img => img.src)
    console.log(href.length)
    return { "href": href, "title": content, 'img': img }
  });
}
let index = 0;
(async () => {

  cluster = await cluster;
  await cluster.task(async ({ page, data: { url = "", layer = 0, from = "", root = "" } }) => {
    await page.goto(url, { waitUntil: "networkidle2" });

    let data = await classify(url, await getInfo(page), root);

    queue.push(url);

    page.close();
    checkURL(data.exteralLink.href, data.exteralLink.title, url);
    checkURL(data.interalLink.href, data.interalLink.title, url);
    checkURL(data.img, url);
    console.log(`Layer${layer} -> ${url} \nFrom -> ${from}`);
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