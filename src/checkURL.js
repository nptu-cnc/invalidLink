import axios from "axios";
import fs from 'fs'
import https from 'https'
import moment from "moment";



export default async function checkURL(url = [], title = [], from = "") {

    let statusCode = 0;
    let redirectURL = "";

    
    
    
    for (let i of url) {
        if(i.includes("javascript:")) continue;
        if(i.includes("/app/authimg")) continue;
        try {
            let resp = await axios.get(i, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            });
            
            statusCode = resp.status;
        }
        catch (err) {
            try{
                statusCode = 0;
                statusCode = err.response.status
            }
            catch(err){
            }
            let result = `${from}, to , ${i} , ${statusCode??"no status code"} , ${err.code??"no error msg"} \n`
            fs.appendFile(`results/${moment().format("YYYY-MM-DD")}-error.csv`,result,err=>{});
        }
        
        if(Number(statusCode) < 300){
            let result = `${from}, to , ${i} , ${statusCode} \n`
                fs.appendFile(`results/${moment().format("YYYY-MM-DD")}-success.csv`,result,err=>{});
            console.log("From : ",from)
            console.log("-URL-: ",i)
            console.log(statusCode)
        }
        

    }
    return;

}