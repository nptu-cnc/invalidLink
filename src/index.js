import { Cluster } from "puppeteer-cluster";
import { Puppeteer } from "puppeteer";


function classify(url, data = { "href": ["", "", ""], "title": ["", "", ""] }) {
  data.href.forEach(i => {
    //console.log("I : ", i);
    if (i.includes(url)) { 
      //console.log("Include : ",i)
    }
    else {
      if(i.includes("http")){
        return;
      }
      let u = ["/app","/p","/var"];
      for(let j of u){
        
        if(i.startsWith(j,0)){
          //console.log("In : ",i)
          i=i.replace(j,url+j)
        }
      }

      console.log("include2 : ",i)
      if(i.startsWith("/app",0)){
      }
      
    }
  })
}


(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    const screen = await page.screenshot();
    let data = await page.evaluate(
      () => {
        let href = Array.from(document.querySelectorAll('a'), a => a.getAttribute('href'))
        let content = Array.from(document.querySelectorAll('a'), a => a.textContent)

        data = {
          "href": href,
          "title": content
        }

        return data;
      }
    );

    //console.log('title', data.href.length)
    classify("https://www.nptu.edu.tw", data);


  });


  cluster.queue('https://www.nptu.edu.tw');
  //cluster.queue('http://www.wikipedia.org/');
  // many more pages

  await cluster.idle();
  await cluster.close();
})();