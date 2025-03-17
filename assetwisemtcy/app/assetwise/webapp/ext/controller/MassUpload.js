sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        uploadFileHandler: function(oEvent) {
            // MessageToast.show("Custom handler invoked.");
			this.routing.navigateToRoute('MassUpload')
        }
    };
});
