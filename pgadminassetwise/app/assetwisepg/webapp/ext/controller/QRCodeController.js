sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/util/File"
], function(MessageToast, MessageBox) {
    'use strict';
    function _createUploadController(oExtensionAPI){
        var oUploadDialog;
        var binaryString;
        var that = oExtensionAPI;
        var url;
        function closeDialog(){
            return oUploadDialog && oUploadDialog.close();
        }
        return {
            onBeforeOpen: function (oEvent) {
                oUploadDialog = oEvent.getSource();
                oExtensionAPI.addDependent(oUploadDialog);
                var uplPath = oEvent.getSource().getBindingContext().getPath();
                var serviceURL = oEvent.getSource().getModel().getServiceUrl();
                var oModel;
                $.ajax({
                    url: serviceURL + uplPath,
                    method: "GET",
                    async: false,
                    success: function (data) {
                        oModel = data;
                    },
                    error: function(error){
                        if(error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message){
                            MessageToast.show(`Unable to fetch data, ${error.responseJSON.error.message}`);
                        }
                    }
                })
                if (oModel) {
                    var payload = {
                        "Asset ID": oModel['ID'] ? oModel['ID'] : "-",
                        "Asset Name":oModel['name'] ? oModel['name'] : "-",
                        "Description 1":oModel['desc1'] ? oModel['desc1'] : "-",
                        "Description 2":oModel['desc2'] ? oModel['desc2'] : "-",
                        "Description 3":oModel['desc3'] ? oModel['desc3'] : "-",
                        "Barcode Number":oModel['barcodeNo'] ? oModel['barcodeNo']: "-",
                        "Serial Number":oModel['serialNo'] ? oModel['serialNo'] : "-",
                        "User Team":oModel['userTeam'] ? oModel['userTeam'] : "-",
                        "User":oModel['user'] ? oModel['user'] : "",
                        "Owned Team":oModel['ownedTeam'] ? oModel['ownedTeam'] : "-",
                        "Owner":oModel['Owner'] ? oModel['Owner'] : "-",
                        "Asset Group":oModel['group'] ? oModel['group'] : "-",
                        "Sub Group":oModel['subGroup'] ? oModel['subGroup'] : "-" 
                    }
                    var allString;
                    allString = JSON.stringify(payload);
                    allString = allString.slice(1,allString.length-1).split('"').join("");
                    var baseURL = "https://quickchart.io/qr?text=";
                    var codedString = encodeURIComponent(allString.split(",").join("\n"))
                    url = baseURL + codedString + "&size=250";
                    var Image = sap.ui.core.Fragment.byId("qrcodeDialog", "qrcode");
                    Image.setSrc(url)
                }
            },

            onAfterClose: function (oEvent) {
                oExtensionAPI.removeDependent(oUploadDialog);
                oUploadDialog.destroy();
                oUploadDialog = undefined;
            },
            onClose: function(oEvent){
                closeDialog();
            },
            onPrint: function(oEvent){
                var win = window.open('');
                win.document.write('<img src="' + url + '" onload="window.print();window.close()" />');
                win.focus()
                // var oTarget = sap.ui.core.Fragment.byId("qrcodeDialog", "qrcode");
                // var $domTarget = oTarget.$()[0],
                // sTargetContent = $domTarget,
                // sOriginalContent = document.body.innerHTML;
                
                // document.body.innerHTML = url;
                // window.print();
                // document.body.innerHTML = sOriginalContent;
                closeDialog();
            },
        }
    }

    return {
        handleQRCode: function(oEvent) {
            this.loadFragment({
                id: "qrcodeDialog",
                name: "com.mindset.ui.assetwisepg.custom.fragment.QRCode",
                controller: _createUploadController(this)
            }).then(function (oDialogn) {
                oDialogn.open();
            });
        }
    };
});
