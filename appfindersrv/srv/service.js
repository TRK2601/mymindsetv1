const cds = require('@sap/cds');
const axios = require('axios');
const btoa = require('btoa');
const atob = require('atob');
const sgMail = require('@sendgrid/mail');
const { ShareInfoSet } = cds.entities('com.mindset.accelerator.merlincapmsrv');

async function _customFunction(req, res) {
    // Implement custom logic here 
    if (req.data && req.data.msg) {
        return 'The function call with params..!'
    } else {
        return 'The function call..!'
    }
}
async function _callJobFunc(req, res){
    //to sent email    
sgMail.setApiKey('YOUR_API_KEY');

const msg = {
  to: '<abc@gmail.com>', 
  from: 'xyz@gmail.com', 
  subject: 'Your Subject',
  html: '<strong> YOUR EMAIL CONTENT </strong>',
  attachments: [{"content": "dGVzdA==", "type": "text/plain", "filename": "attachment.txt"}]
};

}

async function _connectToSystemAndReadData(req, res) {
    //Tbd
    var sUrl = req.data.url;
    var sUserID = req.data.userName;
    var sPwd = atob(req.data.password);
    //var sUrl = "http://s4hana2020.mindsetconsulting.com:50000/sap/opu/odata/sap/ZCAI_RESET_PASSWORD_SRV/SystemDetailSet?$filter=UserID eq 'hanantha'";
   // var sUrl = "http://s4hana2020.mindsetconsulting.com:50000/sap/opu/odata/sap/ZCAI_RESET_PASSWORD_SRV/SystemDetailSet?$filter=UserID%20eq%20%27hanantha%27";
    
   return await axios.get(sUrl, {
    headers: {
        'Authorization': 'Basic ' + btoa(sUserID + ':' + sPwd)
    }
   }).then(response => {
        //console.log('response trigger');
        //console.log(btoa('hanantha' + ':' + 'Connect@12'));
        //console.log(atob('aGFuYW50aGE6IUAjJENvbm5lY3RAMTIqKiZe'));
        //console.log(response.data);//here we will get access token"
        //post message to Queue API
        return response;
    }).catch(err => {
        console.log('err');
        return err;
    });   
}
/**
 * Validating pass key
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function _onValidatePassKey (req, res) {
    const { passKey } = req.data;
    if (passKey) {
        let srv = await cds.connect.to('ZMINDSET_S4_APP_FINDER_SRV');
        let sSrv = srv.tx();        
        try {
            const resAsset = await sSrv.run(SELECT.from('ShareInfoSet').where({ passKey: passKey }));
            await sSrv.commit();
            if (resAsset && resAsset.length > 0) { 
                if (resAsset[0].id) {
                    let oData = {
                        count: resAsset[0].count ? resAsset[0].count + 1 : 1,
                        lastAccessDate: new Date()
                    }
                    sSrv = srv.tx(); 
                    try {
                        let odata = await sSrv.run(UPDATE('ShareInfoSet').set(oData).where({ id: resAsset[0].id }));
                        let oGetData = await sSrv.run(SELECT.from('ShareInfoSet').where({ passKey: passKey }));
                        await sSrv.commit();
                        return oGetData;
                    } catch (error) {
                        await sSrv.rollback(error);
                    }                    
                } else {
                    return resAsset;
                }     
            } else {
                return {
                    Error: "Please check Pass Key..!"         
                };
            }
        } catch (error) {
            await sSrv.rollback(error);
            return {
                Error: "Please check Pass Key..!"         
            };
        }
    } else {
       return {
            Error: "Please check Pass Key..!. Host:  "
            // Error: "Please check Pass Key..!. Host:  "  + JSON.stringify(req.headers)      
      };

    }

}
/**
 * Getting data based on ID
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function _onGetDataByID (req, res) {
    const { ID } = req.data;
    if (ID) {
        let srv = await cds.connect.to('ZMINDSET_S4_APP_FINDER_SRV');
        let sSrv = srv.tx();
        try {
            const resAsset = await sSrv.run(SELECT.from('ShareInfoSet').where({ ID: ID }));
            await sSrv.commit();
            if (resAsset) {                
                return resAsset;
            } else {
                return {
                    Error: "Please check Pass Key..!"       
                };
            }
        } catch (error) {
            await sSrv.rollback(error);
            return {
                Error: "Please check Pass Key..!"         
            };
        }
    } else {
       return {
            Error: "Please check Pass Key..!"         
      };

    }

}
module.exports = function (srv) {
    srv.on('POST', 'SystemConnectionInfo', _connectToSystemAndReadData);
    srv.on('myfuntion', _callJobFunc);
    // TBD
    srv.on('onValidatePassKey', _onValidatePassKey);
    srv.on('onGetDataByID', _onGetDataByID);

    // Test Case function.
    srv.on('onTestCase', (req, next) => {
        return {Data: JSON.stringify(req.headers)};
      })
};