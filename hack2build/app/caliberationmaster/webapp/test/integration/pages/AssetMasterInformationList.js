sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.mindset.hack2build.caliberationmaster',
            componentId: 'AssetMasterInformationList',
            contextPath: '/AssetMasterInformation'
        },
        CustomPageDefinitions
    );
});