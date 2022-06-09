import axios from "axios";
import fs from 'fs'
import https from 'https'




export default async function checkURL(url = [], title = [], from = "") {

    let statusCode = 0;
    let redirectURL = "";

    
    
    
    let index = 0;
    for (let i of url) {

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
                statusCode = err.response.status
                redirectURL = err.request.responseUrl;
            }
            catch(err){

            }
        }

        if(Number(statusCode) >200){
            
            console.log("From : ",from)
            console.log("URL : ",i)
            console.log("Title : ", title[index])
            console.log(statusCode)
        }
        


        index++;
    }
    return;

}