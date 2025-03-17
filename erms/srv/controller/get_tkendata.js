const dotenv = require('dotenv');
const axios = require('axios');
const btoa = require('btoa');

exports.onReadTokenData = async function(req, res, custom) {
    if(req){        
        let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';    
        const username = 'sb-6bf4cd57-1295-4151-b885-572476b677b2!b37789|xsuaa!b49390';
        const password = '6fa4bcbd-3aab-4e30-927a-989baef4c1ff$4rTRaeBmCfmhDbLbKGpd5cIdZgSQZ_EHabJiEebd3Ls=';

        const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
        let basicAuth = 'Basic ' + btoa(username + ':' + password);
        return await axios.get(tokenurl,{
            headers: {
                'Authorization': basicAuth
            }
        }).then(async response => {
            console.log("Level19 : ..........!"  + response);
            if (custom) {
                return response.data;                 
            } else {
                return response;  
            } 
        }).catch(err => {
            console.log('err');
            console.log("Level20 : ..........!"  + err);
            return null;
        });
    } else {
        return null;
    }  
}

