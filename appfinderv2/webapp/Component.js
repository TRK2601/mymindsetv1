sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/mindset/accelerator/appfinder/v2/model/models",
        "com/mindset/accelerator/appfinder/v2/controller/lib/jszip",
        "com/mindset/accelerator/appfinder/v2/controller/lib/xlsx"
    ],
    function (UIComponent, Device, models, jszip, xlsx) {
        "use strict";

        return UIComponent.extend("com.mindset.accelerator.appfinder.v2.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);