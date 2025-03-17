/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/mindset/ui/assetwisepg/workflow/model/models"
],
function (UIComponent, Device, models) {
    "use strict";
    var oComponent, oGlobalModel, sSrvURL;
    return UIComponent.extend("com.mindset.ui.assetwisepg.workflow.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            var aPromises = [];
            oComponent = this;
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            //set Global Model
            this.setModel(models.createRequestModel(), "GlobalModel");
            oGlobalModel = oComponent.getModel("GlobalModel");
            sSrvURL = this.getModel().getServiceUrl();
            oComponent._getLoggedInUserInfo();
            var promise2 = new Promise(function(resolve, reject){
                oComponent._getEmployees(resolve, reject);
            });
            var promise3 = new Promise(function(resolve, reject){
                oComponent._getBaseLocations(resolve, reject);
            }); 
        },
        _getLoggedInUserInfo: function(){
            sSrvURL = this.getModel().getServiceUrl();
            var sEmailId, sName="";
            jQuery.ajax({
                url: sSrvURL+ "/userInfo()",
                async: false,
                dataType: "json",
                contentType: "application/json",
                type: "GET",
                success: function (data) {
                    if(data && data.value){
                        sEmailId = data.value.id;
                        sName = (data && data.value && data.value && data.value["attr"] && ((data.value["attr"].givenName || "") + " " + (data.value["attr"].familyName || "")).trim()) || "";
                        if(sEmailId === "anonymous"){
                             sEmailId = "abhilashgampa@mindsetconsulting.com"; 
                             sName =  "Abhilash Gampa";
                            
                            //  sEmailId = "ravikrishna@mindsetconsulting.com";
                            //  sName =  "Ravi krishna Thota"; 
                            
                            //sEmailId = "ganeshkashyap@mindsetconsulting.com"
                            //sName = "Ganesh Kashyap"

                            //  sEmailId = "amritmohapatro@mindsetconsulting.com"
                            //  sName = "Amrith Mohapatro"

                            //  sEmailId = "raghavendrakesa@mindsetconsulting.com";
                            //  sName =  "Raghavendra"; 
        
                            // sEmailId = "shrinathregde@mindsetconsulting.com"; 
                            // sName =  "Shrinath Regde"; 
                        }
                        oGlobalModel.setProperty("/LoggedInUserID", sEmailId);
                        oGlobalModel.setProperty("/LoggedInUserName", sName);
                    }                                
                },
                error: function () {
                    MessageToast.show("Cannot fetch user details.");
                }
            });
        },
        _getEmployees:function(resolve, reject){
            oGlobalModel.setProperty("/LoginEmployeeData", []);
            jQuery.ajax({
                url: sSrvURL + "Employee?$filter=email eq '"+ oGlobalModel.getProperty("/LoggedInUserID") +"'",
                async: false,
                dataType: "json",
                contentType: "application/json",
                type: "GET",
                success: function (data, o, i) {
                    resolve();
                    if(data && data.value && data.value.length > 0 ){
                        oGlobalModel.setProperty("/LoginEmployeeData", data.value);
                    }                                 
                },
                error: function (e, t, o) {
                    resolve();
                    MessageToast.show("post failed");
                }
            });

        },
        _getBaseLocations:function(resolve, reject){
            jQuery.ajax({
                url: sSrvURL + "BaseLocation?$expand=assignedFunctionalLocations",
                async: false,
                dataType: "json",
                contentType: "application/json",
                type: "GET",
                success: function (data, o, i) {
                    resolve();
                    if(data && data.value && data.value.length > 0 ){
                        oGlobalModel.setProperty("/BaseLocationSet", data.value);
                    }                                 
                },
                error: function (e, t, o) {
                    resolve();
                    MessageToast.show("post failed");
                }
            });
        }
    });
}
);