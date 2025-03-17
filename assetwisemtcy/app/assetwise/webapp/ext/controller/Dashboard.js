sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/BusyDialog"
], function(MessageToast, BusyDialog) {
    'use strict';

    return {
        onPressDashboardBtn: function(oEvent) {
            var oBusyDialog = new BusyDialog({
                busyIndicatorDelay: 0
            });
            oBusyDialog.open();
            setTimeout(function() {
				oBusyDialog.close();
			}.bind(this), 5000);
            sap.ui.require(["sap/ushell/Container"], async (Container) => {
                const oNavigationService = await Container.getServiceAsync("Navigation");
                const sHref = await oNavigationService.getHref({
                  target : {
                    semanticObject: "dashboard",
                    action: "display"
                  }
                });
                var url = window.location.href.split('#')[0] + sHref;
                sap.m.URLHelper.redirect(url, false);
              });
        }
    };
});
