sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.mindset.hack2build.caliberationmaster',
            componentId: 'AssetMasterInformationObjectPage',
            contextPath: '/AssetMasterInformation'
        },
        CustomPageDefinitions
    );
});