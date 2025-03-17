sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/mindset/ui/assetwisepg/test/integration/FirstJourney',
		'com/mindset/ui/assetwisepg/test/integration/pages/AssetMasterList',
		'com/mindset/ui/assetwisepg/test/integration/pages/AssetMasterObjectPage'
    ],
    function(JourneyRunner, opaJourney, AssetMasterList, AssetMasterObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/mindset/ui/assetwisepg') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheAssetMasterList: AssetMasterList,
					onTheAssetMasterObjectPage: AssetMasterObjectPage
                }
            },
            opaJourney.run
        );
    }
);