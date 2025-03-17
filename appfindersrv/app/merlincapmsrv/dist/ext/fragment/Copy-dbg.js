sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function(MessageToast, MessageBox) {
    'use strict';

    return {
        onPress: function(oEvent) {
            if (oEvent && oEvent.getSource() && oEvent.getSource().getBindingContext() && oEvent.getSource().getBindingContext().getObject()) {
                var sPasskey = oEvent.getSource().getBindingContext().getObject() && oEvent.getSource().getBindingContext().getObject().passKey;
                var sCustomerName = oEvent.getSource().getBindingContext().getObject() && oEvent.getSource().getBindingContext().getObject().customerName;

                var hostURL = window.location.origin;
                var sURL = null;
                var sUIAppURL = '/c27d66ec-ef19-4d40-b7f2-a72646435d9f.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                if (hostURL && hostURL.indexOf("mindsetdevelopment") !== -1) {
                    // TTD
                    hostURL = hostURL;
                    sUIAppURL = '/c27d66ec-ef19-4d40-b7f2-a72646435d9f.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                    sURL = hostURL + sUIAppURL;
                } else if (hostURL && hostURL.indexOf("mindset-software-dev") !== -1) {
                    // Software
                    hostURL = hostURL;
                    sUIAppURL = '/b588e763-6027-439e-a570-ca1e1b70f3f7.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                    sURL = hostURL + sUIAppURL;
                } else {
                    //  Local test case (TTD dev)
                    hostURL = 'https://mindsetdevelopment.launchpad.cfapps.us10.hana.ondemand.com/';
                    sURL = hostURL + sUIAppURL;
                }
                //var sURL = 'https://mindset-software-dev-cf-38dfv4fm.launchpad.cfapps.us10.hana.ondemand.com/b588e763-6027-439e-a570-ca1e1b70f3f7.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                
                var sCopyData = 'URL: ' + sURL + '   \n\n  ' +
                                'Report ID: ' + sPasskey;
                if (sCopyData) {
                    var tempInput = document.createElement("textarea");
                        tempInput.style = "fixed";
                        tempInput.style.opacity = 0;
                        tempInput.value = sCopyData;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        tempInput.setSelectionRange(0, 99999); // For mobile devices
                        document.execCommand("copy");
                        document.body.removeChild(tempInput);

                        MessageBox.success('The report for Client "' + sCustomerName + '"  has been prepared and is now available. \n  Kindly provide the following link and Report ID to your customer for accessing the report. '  + '\n\n' + sCopyData, {
                            title: "The following details are now availabe in your clip-board",
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                // MessageToast.show("Action selected: " + sAction);
                            }
                        }); 

                    // sap.m.MessageToast.show("Passkey copied to clipboard \n : " +  sCopyData);
                }
            } else {                
                MessageToast.show("Copy error...!");
            }
        }
    };
});
