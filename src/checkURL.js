import axios from "axios";
import fs from 'fs'
import https from 'https'
import moment from "moment";



export default async function checkURL(url = [], title = [], from = "") {

    let statusCode = 0;
    let redirectURL = "";


    let index = 0;
    for (let i of url) {
        if (i.includes("javascript:")) continue;
        if (i.includes("/app/authimg")) continue;
        try {
            let resp = await axios.get(i, {

                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                    keepAlive: false

                })
            });

            statusCode = resp.status;
        }
        catch (err) {
            try {
                statusCode = null;
                statusCode = err.response.status ?? "-";
            }
            catch (err) {
            }
            if (!statusCode || (Number(statusCode) > 300 || Number(statusCode) < 200)) {
                let result = `${title[index]} , ${from}, to , ${i} , ${statusCode ?? "no status code"} , ${err.code ?? "no error msg"} \n`
                fs.appendFile(`results/${moment().format("YYYYMMDD")}-error.csv`, result, err => { });
            }
        }

        if ((Number(statusCode) < 300 || Number(statusCode) > 200)) {

            let result = `${title[index]},${from}, to , ${i} , ${statusCode} \n`
            fs.appendFile(`results/${moment().format("YYYYMMDD")}-success.csv`, result, err => { });
            if (0) {

                console.log("From : ", from)
                console.log("-URL-: ", i)
                console.log(statusCode)
            }
        }

        index++;

    }
    return;

}