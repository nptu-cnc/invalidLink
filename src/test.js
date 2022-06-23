import axios from "axios";

console.log("Hi");

(async ()=>{
    let x = await axios.get("https://openapi.twse.com.tw/v1/opendata/t187ap37_L")
    console.log(x.data)
})()




