const cds = require('@sap/cds');
const exp = require('express'); 
const xenv = require('@sap/xsenv');
const dotenv = require('dotenv');
// const hdbext = require('@sap/hdbext');
const axios = require('axios');
const btoa = require('btoa');
const  onTokenData  = require('./controller/get_tkendata.js');
const  onWFData  = require('./controller/wf_tigger.js');
const  onTaskData  = require('./controller/task.js');
const app = exp();
const { Reimbersment, Employee } = cds.entities('com.mindset.erms');

async function _readWFTokenData(req, res) {
    return await onTokenData.onReadTokenData(req, res, "custom");   
};
module.exports = function (srv) {
    srv.on('getWFTaskUpdateData', onTaskData._getWFTaskUpdateData);
    srv.on('getWFLogsData', onTaskData._readWFLogsData);
    srv.on('getWFTokenData', _readWFTokenData);
    srv.on ('POST', 'WfTrigger', onWFData._readData);
    srv.on ('UPDATE', 'WfTrigger', onTaskData._getWFTaskUpdateData);    
};


