sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast) {
        "use strict";
        var oGlobalModel,oModel;
        return Controller.extend("com.mindset.labtestform.controller.Home", {

            /**
             * init function
             */
            onInit: function () {               
               

                oGlobalModel = this.getOwnerComponent().getModel();
                oModel =  this.getOwnerComponent().getModel("labTestModel");
                this.getMaterials();
                 //calling the setTime function.
                 this._setTimeText();
            },

            /**
             * @param {oEvent} object of Role selection
             * @function
             */
            onHandleRole: function(oEvent){
              
                var sKey = oEvent.getParameters().selectedItem.getKey();
                if(sKey === 'Lab Technician' || sKey === 'Researcher'){
                    oModel.setProperty("/objForm/visiblePanel",true);
                }
                else{
                    oModel.setProperty("/objForm/visiblePanel",false);
                }
             },


             /**
              * function for sending the data to CAP service
              * @function
              */
            onSave: function(){               
                var oFormData = oModel.getProperty("/objForm"); 
                 oFormData.universityid = parseInt(oFormData.universityid);
                delete oFormData.visiblePanel;
                var that = this;
               $.ajax({                 

                        type: "POST",
                        url: oGlobalModel.getServiceUrl() +"LabAssessmentInfo",
                        contentType: "application/json",
                        data: JSON.stringify(oFormData),
                        async: true,
                        success: function (response) {
                            MessageToast.show("Successfully submitted");
                            that.onCancel();
                        },
                        error: function (response) {
                           console.log(response);
                        }

                } );                

            },


            /**
             * function for cancel
             * @function
             */
            onCancel: function(){
               
                // var oFormData = oModel.getProperty("/objForm");
                oModel.setProperty("/objForm",{});
            },

            /**
             * function for date change
             * @function
             * @param { oEvent} object for date selection
             */
            onDateChange: function(oEvent){
                var dDate = new Date(oEvent.getParameter("newValue"));
                oModel.setProperty("/objForm/formFilledDate",dDate.toISOString());
            },

            /**
             * function for setting the time to the text control.
             */
            _setTimeText: function(){
        
                var that = this;
                setInterval(function() {
                that.getView().byId("idTextDate").setText("Time :" + new Date());
                },1000);
   
            },


            getMaterials: function(){
                var that = this;
                $.ajax({                 
 
                         type: "GET",
                         url: oGlobalModel.getServiceUrl() +"AssetInformation()",
                         contentType: "application/json",
                       
                         async: true,
                         success: function (response) {
                           oModel.setProperty("/MaterialType",response.value);
                             
                         },
                         error: function (response) {
                            console.log(response);
                         }
 
                 } );              
            }
        });
    });
