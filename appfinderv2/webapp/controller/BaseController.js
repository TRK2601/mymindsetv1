sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.mindset.accelerator.appfinder.v2.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		/*
		 * Set Busy Indicators
		 */
		loadBusyIndicator: function (content, isBusy) {
			var pageContent = content && this.getView().byId(content);
			pageContent = (pageContent) ? pageContent : (content && sap.ui.getCore().byId(content));
			if (pageContent) {
				pageContent.setBusy(isBusy);
			}
		},
        /**
		 * Method to handle errors
		 */
		handleErrors: function (error, oBundle) {
            var sMsg="", sErrDetails;
			try {
				var iJsonLength = error && JSON.parse(error.responseText).error.innererror.errordetails && JSON.parse(error.responseText).error.innererror
					.errordetails
					.length;
			} catch (e) {
				//return;
			}
			if (iJsonLength > 0 && error) {
				jQuery.each(JSON.parse(error.responseText).error.innererror.errordetails, function (mIdx, mObj) {
					if (mObj.message.trim() !== "") {
						if (mObj.code.indexOf("EXCEPTION") === -1) {
                            sMsg = sMsg + "<li>" + mObj.message + "</li>";
						}
					}
				});
                MessageBox.error(oBundle.getText("errorOccured"), {
                    details:
                        "<ul>" + sMsg + "</ul>",
                    contentWidth: "100px",
                    styleClass: sResponsivePaddingClasses
                });
			} else if (error && error.responseText && error.responseText.indexOf("xml") !== -1) {
				sap.m.MessageBox.error(jQuery.parseXML(error.responseText).getElementsByTagName("message")[0].innerHTML);
			} else if(error && error.responseText && typeof error.responseText == 'string'){
				sap.m.MessageBox.error(error.responseText);
			} else if(error && error.responseText && JSON.parse(error.responseText).error && JSON.parse(error.responseText).error.message) {
				sap.m.MessageBox.error(JSON.parse(error.responseText).error.message);
			} else {
				sap.m.MessageBox.error("An error has been occurred !!");
			}
		}
	});
});
