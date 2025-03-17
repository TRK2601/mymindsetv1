sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(MessageToast,MessageBox,Fragment,Controller,JSONModel) {
    'use strict';
    function _createUploadController(oExtensionAPI){
        var oUploadDialog;
        var binaryString;
        var that = oExtensionAPI;
        function closeDialog(){
            return oUploadDialog && oUploadDialog.close();
        }
        function uploadFileHandler(oEvent){
            // fileUploader
            // var oFileUploader = this.byId("fileUploader")
            // var uplPath = oEvent.getPath();
            // oFileUploader
            //     .checkFileReadable()
            //     .then(function () {
            //     $.ajax({
            //     url: uplPath + "/uploadSoftCopy",
            //     method: "PUT",
            //     Authorization: "Basic inventoryadmin initial",
            //     contentType: "image/jpeg",
            //     success: function () {
            //     MessageToast.show("Assets created successfully!");
            //     },
            //     })
            //     })
            //     .catch(function (error) {
            //         showError("The file cannot be read.");
            //     })
        }
        function byId(sId) {
            return sap.ui.core.Fragment.byId("uploadDialog", sId);
        }
        return {
            onBeforeOpen: function (oEvent) {
                oUploadDialog = oEvent.getSource();
                oExtensionAPI.addDependent(oUploadDialog);
            },

            onAfterClose: function (oEvent) {
                oExtensionAPI.removeDependent(oUploadDialog);
                oUploadDialog.destroy();
                oUploadDialog = undefined;
            },
            onCancel: function(oEvent){
                closeDialog();
            },
            validateFile: function(oEvent){
                var file = oEvent.getParameter("files")[0];
                var reader = new FileReader();
                reader.onload = function (evn) {
					binaryString = btoa(evn.target.result); //string in CSV					
				};
                reader.readAsBinaryString(file);
            },
            onUpload: function(oEvent){
                var oFileUploader = byId("fileUploader");
                var oObjectPageId = oEvent.getSource().getParent().getParent().getId();
                var oObjectPage = sap.ui.getCore().byId(oObjectPageId);
                if (!oFileUploader.getValue()) {
                    MessageToast.show("Choose a file first");
                    return;
                }
                var payload = binaryString;
                var serviceURL = oEvent.getSource().getModel().getServiceUrl();
                var uplPath = oEvent.getSource().getBindingContext().getPath();
                oObjectPage.setBusy(true);
                $.ajax({
                        url: serviceURL + uplPath + "/profilePicContent",
                        contentType: 'image/png',
                        method: "PUT",
                        data: payload,
                        success: function () {
                            $.ajax({
                                url: serviceURL + uplPath,
                                contentType: 'application/json',
                                method: "PATCH",
                                data: JSON.stringify({
                                    profilePicUpdated: true
                                }),
                                success: function () {
                                    oObjectPage.setBusy(false);
                                    MessageToast.show("Image has been saved as draft. It won't be saved until you Save the asset.",{
                                        duration: 4000,
                                        width: "20em"
                                    });
                                },
                                error: function(error){
                                    oObjectPage.setBusy(false);
                                    if(error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message){
                                        MessageToast.show(`Upload Failed, ${error.responseJSON.error.message}`);
                                    }
                                }
                            });
                        },
                        error: function(error){
                            oObjectPage.setBusy(false);
                            if(error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message){
                                MessageToast.show(`Upload Failed, ${error.responseJSON.error.message}`);
                            }
                        }
                })
                closeDialog();
            }
        }
    }
    return {
        UploadAssetImgHandler: function(oEvent) {          
            this.loadFragment({
                id: "uploadDialog",
                name: "com.mindset.ui.assetwisepg.custom.fragment.AssetImgUpl",
                controller: _createUploadController(this)
            }).then(function (oDialog) {
                oDialog.open();
            });
            // if (!this._oDialog) {
            //     this._oDialog = Fragment.load({
            //         id:this.getInterface().getEditFlow().getView().getId(),
            //         name: "com.mindset.inventoryspecialist.custom.fragment.AssetImgUpl",
            //         controller: _createUploadController(this)
            //     }).then(function (oDialog) {
            //         oDialog.open()
            //     })}
            // if (!this.dialog) {
            //     // This fragment can be instantiated from a controller as follows:
            //     this.dialog = sap.ui.xmlfragment("com.mindset.inventoryspecialist.custom.fragment.AssetImgUpl", this);
            // }
            // this.dialog.open();
            // var fileUploader = new sap.ui.unified.FileUploader('fileUploader');
            // var uplPath = oEvent.getPath();
            // MessageBox.information(fileUploader, {
            //     actions: [MessageBox.Action.OK,MessageBox.Action.CLOSE],
            //     emphasizedAction: MessageBox.Action.CLOSE,
            //     onClose: function (sAction,uplPath) {
            //         if(sAction='OK'){
            //             $.ajax({
            //                 url: uplPath + "/uploadSoftCopy",
            //                 method: "PUT",
            //                 Authorization: "Basic inventoryadmin initial",
            //                 contentType: "image/jpeg",
            //                 success: function () {
            //                   MessageToast.show("Assets created successfully!");
            //                 },
            //               })
            //         }
			// 	}
            // })
        }
    };
});
