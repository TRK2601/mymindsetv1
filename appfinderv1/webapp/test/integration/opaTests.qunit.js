/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/mindset/accelerator/appfinder/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
