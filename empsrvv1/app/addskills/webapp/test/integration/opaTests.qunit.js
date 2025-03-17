sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'app/addskills/test/integration/FirstJourney',
		'app/addskills/test/integration/pages/SkillsList',
		'app/addskills/test/integration/pages/SkillsObjectPage'
    ],
    function(JourneyRunner, opaJourney, SkillsList, SkillsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('app/addskills') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSkillsList: SkillsList,
					onTheSkillsObjectPage: SkillsObjectPage
                }
            },
            opaJourney.run
        );
    }
);