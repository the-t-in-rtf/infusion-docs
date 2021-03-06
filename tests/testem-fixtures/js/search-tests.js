/* globals jqUnit */
(function (fluid, jqUnit, $) {
    "use strict";
    fluid.registerNamespace("fluid.test.docs.search")

    fluid.defaults("fluid.tests.search.searchCreationElement", {
        gradeNames: ["fluid.test.sequenceElement"],
        sequence: [
            { func: "{environment}.events.createSearch.fire" }
        ]
    });

    fluid.defaults("fluid.test.search.createSearchComponent", {
        gradeNames: ["fluid.test.sequence"],
        sequenceElements: {
            createSearch: {
                gradeNames: "fluid.tests.search.searchCreationElement",
                priority: "first"
            }
        }
    });

    fluid.registerNamespace("fluid.test.docs.search.caseHolder");

    fluid.test.docs.search.caseHolder.checkSearchResults = function (searchComponent, message, minResults, maxResults) {
        var resultsElement = searchComponent.locate("searchResults");
        var singlePageResultElements = $(resultsElement).find(".search-result-single-page");

        if (minResults) {
            jqUnit.assertTrue(message + " : minimum results", singlePageResultElements.length >= minResults);
        }

        jqUnit.assertTrue(message + " : maximum results", singlePageResultElements.length <= maxResults);
    };

    // Searches should listen for the onRender before checking results in
    fluid.defaults("fluid.test.docs.search.caseHolder", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Documentation search tests",
            tests: [
                {
                    name: "We should be able to search for something.",
                    sequenceGrade: "fluid.test.search.createSearchComponent",
                    sequence: [
                        {
                            funcName: "fluid.test.docs.search.caseHolder.checkSearchResults",
                            args: ["{environment}.search", "There should be no results on startup", 0, 0] // searchComponent, message, minResults, maxResults
                        },
                        {
                            func: "{environment}.search.applier.change",
                            args: ["qs", "infusion"]
                        },
                        {
                            event: "{environment}.events.searchResultsRendered",
                            listener: "fluid.test.docs.search.caseHolder.checkSearchResults",
                            args: ["{environment}.search", "Search with matches", 10, 1000] // searchComponent, message, minResults, maxResults
                        }
                    ]
                },
                {
                    name: "A search with no results should be handled properly.",
                    sequenceGrade: "fluid.test.search.createSearchComponent",
                    sequence: [
                        {
                            func: "{environment}.search.applier.change",
                            args: ["qs", "freddled gruntbuggly"]
                        },
                        {
                            event: "{environment}.events.searchResultsRendered",
                            listener: "fluid.test.docs.search.caseHolder.checkSearchResults",
                            args: ["{environment}.search", "Search with no matches", 0, 0] // searchComponent, message, minResults, maxResults
                        }
                    ]
                }
            ]
        }]
    });

    // Environment that resets the markup and instantiates the search component for test run.
    fluid.defaults("fluid.test.docs.search.environment", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".docs-search",
        events: {
            createSearch: null,
            searchResultsRendered: null
        },
        components: {
            search: {
                createOnEvent: "{environment}.events.createSearch",
                type: "fluid.docs.search",
                container: ".docs-search",
                options: {
                    listeners: {
                        "onRender.notifyParent": {
                            func: "{environment}.events.searchResultsRendered.fire"
                        }
                    }
                }
            },
            caseHolder: {
                type: "fluid.test.docs.search.caseHolder"
            }
        }
    });
})(fluid, jqUnit, $);
