sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.mindset.ui.assetwisepg',
            componentId: 'AssetMasterList',
            contextPath: '/AssetMaster'
        },
        CustomPageDefinitions
    );
});