sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/mindset/hack2build/caliberationmaster/test/integration/FirstJourney',
		'com/mindset/hack2build/caliberationmaster/test/integration/pages/AssetMasterInformationList',
		'com/mindset/hack2build/caliberationmaster/test/integration/pages/AssetMasterInformationObjectPage'
    ],
    function(JourneyRunner, opaJourney, AssetMasterInformationList, AssetMasterInformationObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/mindset/hack2build/caliberationmaster') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheAssetMasterInformationList: AssetMasterInformationList,
					onTheAssetMasterInformationObjectPage: AssetMasterInformationObjectPage
                }
            },
            opaJourney.run
        );
    }
);