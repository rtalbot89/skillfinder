/// <reference path="../scripts/jasmine/jasmine.js" />
/// <reference path="../../pcon/scripts/angular.js" />
/// <reference path="../../pcon/scripts/angular-mocks.js" />
/// <reference path="../../pcon/scripts/angular-route.js" />
/// <reference path="../../pcon/scripts/angular-resource.js" />
/// <reference path="../../pcon/scripts/angular-ui.js" />
/// <reference path="../../pcon/scripts/angular-ui/ui-bootstrap.js" />
/// <reference path="../../pcon/scripts/app/app.js" />
/// <reference path="../../pcon/scripts/app/services.js" />

var profileData = [
    {
        "user": { "userName": "ablack", "name": "Anne G. Black" },
        "ou": { "name": "WMG" },
        "skills": [{ "name": "Customer enquiries" }]
    }, {
        "user": { "userName": "adee", "name": "Arthur Dee" },
        "ou": { "name": "CSG" },
        "skills": [{ "name": "Data analysis" }, { "name": "Report writing" }, { "name": "Process fix" }]
    }, {
        "user": { "userName": "jgreen", "name": "Joan Green" },
        "ou": { "name": "Careers and Skills" },
        "skills": [{ "name": "Report writing" }, { "name": "Data analysis" }, { "name": "KPIs" }]
    }, {
        "user": { "userName": "jwhite", "name": "John White" },
        "ou": { "name": "Student Support Services" },
        "skills": [{ "name": "Customer services" }, { "name": "Requirements gathering" }, { "name": "KPIs" }]
    }, {
        "user": { "userName": "mbrown", "name": "Mary A. Brown" },
        "ou": { "name": "Student Support Services" },
        "skills": [{ "name": "Software evaluation" }, { "name": "Furniture purchasing" }, { "name": "Bid writing" }]
    }, {
        "user": { "userName": "mtremain", "name": "Maureen Tremain" },
        "ou": { "name": "Student Support Services" },
        "skills": [{ "name": "Customer services" }, { "name": "Data analysis" }]
    }, {
        "user": { "userName": "psparks", "name": "Philip Sparks" },
        "ou": { "name": "Careers and Skills" },
        "skills": [{ "name": "Bid writing" }, { "name": "Requirements gathering" }, { "name": "Prince 2 Practitioner" }]
    }, {
        "user": { "userName": "robtalbot89@gmail.com", "name": "Robert Talbot" },
        "ou": { "name": "Library" },
        "skills": [{ "name": "KPIs" }, { "name": "Perl" }, { "name": "JavaScript" }, { "name": "AngularJS" }]
    }, {
        "user": { "userName": "skeen", "name": "Samuel Keen" },
        "ou": { "name": "WMG" },
        "skills": [{ "name": "Customer enquiries" }, { "name": "KPIs" }, { "name": "Customer services" }]
    }, {
        "user": { "userName": "tsmith", "name": "Tom Smith" },
        "ou": { "name": "Library" },
        "skills": [{ "name": "Report writing" }, { "name": "IT purchasing" }, { "name": "Prince 2 Practitioner" }]
    }
];

describe("services", function () {
    var skillArray, arrayFunc, dbNode, $httpBackend;
    beforeEach(function () {
        module("find");
    });

    beforeEach(inject(function ($injector, _skillArray_, _arrayFunc_, _dbNode_) {
        skillArray = _skillArray_;
        arrayFunc = _arrayFunc_;
        dbNode = _dbNode_;
        $httpBackend = $injector.get("$httpBackend");
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("skillArray",
        function () {
            it("can add a skill",
                function () {
                    var skills = [{ name: "skill one" }];
                    skillArray.add(skills, "skill two");
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    expect(skills.length).toEqual(2);
                });

            it("should not add an undefined skill",
                function () {
                    var skills = [{ name: "skill one" }];
                    skillArray.add(skills);
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    expect(skills.length).toEqual(1);
                });

            it("can remove a skill",
                function() {
                    var skills = [{ name: "skill one" }, { name: "skill two" }];
                    skillArray.remove(skills, 1);
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    expect(skills.length).toEqual(1);
                    expect(skills[0].name).toEqual("skill one");
                });

            it("can flatten a skill array",
                function() {
                    var skills = [{ name: "skill one" }, { name: "skill two" }];
                    var result = skillArray.flatten(skills);
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    expect(result).toEqual("skill one, skill two");
                });
        });

    describe("arrayFunc",
        function () {
            it("can count skills in data",
                function() {
                    var data = [
                        {
                            skills: [
                                { name: "skill one" }, { name: "skill two" }
                            ]
                        },
                        {
                            skills: [{ name: "skill one" }, { name: "skill two" }]
                        }
                    ];
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    var result = arrayFunc.skillCount(data);
                    expect(result.length).toEqual(2);
                });
        });

    describe("dbNode",
        function () {
            it("returns all data",
                function () {
                    var graph = {};
                    graph.flag = false;
                    graph.force = {
                        nodes: [],
                        links: []
                    };
                    dbNode.allBySkill(graph);
                    $httpBackend.expectGET("/api/skill").respond(profileData);
                    $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                    $httpBackend.flush();
                    expect(graph.force.nodes.length).toEqual(30);
                    expect(graph.force.links.length).toEqual(38);
                });

            it("returns filtered data",
               function () {
                   var graph = {};
                   graph.flag = false;
                   graph.force = {
                       nodes: [],
                       links: []
                   };
                   graph.skills = ["one", "two"];
                   dbNode.filterBySkill(graph);
                   $httpBackend.expectPOST("/api/skill").respond(profileData);
                   $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                   $httpBackend.flush();
                   expect(graph.force.nodes.length).toEqual(30);
                   expect(graph.force.links.length).toEqual(38);
               });
        });
});