sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.mindset.ui.assetwise',
            componentId: 'AssetMasterObjectPage',
            contextPath: '/AssetMaster'
        },
        CustomPageDefinitions
    );
});