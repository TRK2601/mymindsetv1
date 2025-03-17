sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast) {
		"use strict";
        function formatPayload(wsData){
            Object.keys(wsData).forEach((el)=>{
                if(wsData[el].v === 'fieldValue'){
                    wsData[el].v = 'Field Value'
                }
                if(wsData[el].v === 'oldValue'){
                    wsData[el].v = 'Old Value'
                }
                if(wsData[el].v === 'newValue'){
                    wsData[el].v = 'New Value'
                }
            })
        }
		return {
            onDownloadHistory: function(oEvent){
                var data = this.getEditFlow().getView().getModel('localModel').getData();
                var filename='History_Report.xlsx';
                var wsBasicData = XLSX.utils.json_to_sheet([Object.values(data['basicData'])][0]);
                formatPayload(wsBasicData);
                var wsProcData = XLSX.utils.json_to_sheet([Object.values(data['procurementData'])][0]);
                formatPayload(wsProcData);
                var wsOwnersData = XLSX.utils.json_to_sheet([Object.values(data['ownerData'])][0]);
                formatPayload(wsOwnersData);
                var wsMaintData = XLSX.utils.json_to_sheet([Object.values(data['maintData'])][0]);
                formatPayload(wsMaintData);
                var wsScrapData = XLSX.utils.json_to_sheet([Object.values(data['scrapData'])][0]);
                formatPayload(wsScrapData);
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, wsBasicData, "Basic");
                XLSX.utils.book_append_sheet(wb, wsProcData, "Procurement");
                XLSX.utils.book_append_sheet(wb, wsOwnersData, "Owners");
                XLSX.utils.book_append_sheet(wb, wsMaintData, "Maintenance");
                XLSX.utils.book_append_sheet(wb, wsScrapData, "Scrapping");
                XLSX.writeFile(wb,filename);
            }

        }
    })