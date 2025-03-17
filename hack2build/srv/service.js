const cds = require('@sap/cds');
const exp = require('express'); 
const xenv = require('@sap/xsenv');
const axios = require('axios');
const btoa = require('btoa');

/**
 * getting data from the aseetwise materialtype entityset using the bearer token.
 * @param {*} req  
 * @returns 
 */

async function _readData (req) {
    const oTokenData = await _getTokenData(req);
    if(oTokenData && oTokenData.data.access_token){             
      const URL = "https://mindset-consulting--llc-mindsetbtpdev-btp-dev-asw-srv.cfapps.us10.hana.ondemand.com/odata/v4/assetwise/MaterialType?$select=name";
        try {         
            return await axios.get(URL,{
                headers: {
                    'Authorization': "Bearer " + oTokenData.data.access_token
                }
            }).then(async response => {
                return  response.data.value;   
            }).catch(err => {
                console.log('err');
                return null;
            }); 
        } catch (error) { 
            return {
                Error: "Please check Pass Key..!"
            };
        }
    } else{    
        return {
            Error: "Please check Pass Key..!"
        };
    }

    
}



/**
 *  Getting token from the Assetwise CAP service.
 * @param {*} req 
 * @returns 
 */
async function _getTokenData (req) {
    if(req){        
        let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials';    
        const username = 'sb-assetwise-app01!t37789';
        const password = 'mUBQ2gMDPHAdRgvw30crfU8KW74=';

        let basicAuth = 'Basic ' + btoa(username + ':' + password);
        return await axios.get(tokenurl,{
            headers: {
                'Authorization': basicAuth
            }
        }).then(async response => {
            return response;   
        }).catch(err => {
            console.log('err');
            return null;
        });
    } else {
        return null;
    }
}


module.exports = function (srv) {
    // Custom POst call
    srv.on ('AssetInformation', _readData);
};