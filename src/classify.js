export default async function classify(url = "", data = { "href": [], "content": [], 'img': [], "titleA":[], "titleIMG":[] }, root = "") {
  let img = data.img;
  let exteralLink = { "href": [], "title": [],"content":[] };
  let interalLink = { "href": [], "title": [],"content":[] };

  if (url.endsWith("/", url.length)) {
    url = url.substring(0, url.length -  1);
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
      interalLink.content.push(data.content[i]);
      interalLink.title.push(data.titleA[i]);
    }
    if(!data.href[i].includes(url)){
      exteralLink.href.push(data.href[i]);
      exteralLink.content.push(data.content[i]);
      exteralLink.title.push(data.titleA[i]);

    }
  }
  return { interalLink, exteralLink, img}

}