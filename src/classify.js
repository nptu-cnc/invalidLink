export default async function classify(url = "", data = { "href": [], "content": [], 'img': [], "titleA":[], "titleIMG":[] }, root = "") {

  let titleIMG = data.titleIMG;
  let titleA = data.titleA;
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
    
    if(data.href[i].includes("?Plugin=mobile&Action=mobileads&ad")) continue;


    if (!data.href[i].includes(url)) {

      if (data.href[i].startsWith('/', 0)) {
        data.href[i] = data.href[i].replace('/', root + '/')
      }

    }


    if (data.href[i].includes(url)) {
      interalLink.href.push(data.href[i]);
      interalLink.title.push(data.content[i]);
      //console.log("-In : ",data.href[i])
    }
    if(!data.href[i].includes(url)){
      //console.log("Out : ",data.href[i])
      exteralLink.href.push(data.href[i]);
      exteralLink.title.push(data.content[i]);
    }
  }


  return { interalLink, exteralLink, img, titleA, titleIMG }

}