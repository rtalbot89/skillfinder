/// <reference path="../scripts/jasmine/jasmine.js" />
/// <reference path="../../pcon/scripts/angular.js" />
/// <reference path="../../pcon/scripts/angular-mocks.js" />
/// <reference path="../../pcon/scripts/angular-route.js" />
/// <reference path="../../pcon/scripts/angular-resource.js" />
/// <reference path="../../pcon/scripts/angular-ui.js" />
/// <reference path="../../pcon/scripts/angular-ui/ui-bootstrap.js" />
/// <reference path="../../pcon/scripts/app/app.js" />
/// <reference path="../../pcon/scripts/app/services.js" />
/// <reference path="../../pcon/scripts/app/controllers.js" />
/// <reference path="../../pcon/scripts/app/directives.js" />
/// <reference path="../../pcon/scripts/app/graphdirective.js" />


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

describe("listController", function () {
    var $httpBackend, controller;
    beforeEach(module("find"));

    beforeEach(inject(function ($injector, $controller) {
        $httpBackend = $injector.get("$httpBackend");
        controller = $controller("listController");
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("can filter profiles by skill",
        function () {
            controller.skill = "test";
            controller.addSkill();
            $httpBackend.expectPOST("/api/skill").respond(profileData);
            $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
            $httpBackend.flush();
            expect(controller.searchResults.length).toBe(10);
            expect(controller.skills.length).toBe(1);
            expect(controller.skill).toEqual("");
        });

    it("can clear results if no skill filters",
       function () {
           controller.skills = ["test"];
           controller.removeSkill(0);
           $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
           $httpBackend.flush();
           expect(controller.searchResults.length).toBe(0);
           expect(controller.skills.length).toBe(0);
       });
});

describe("graphController", function () {
    var $httpBackend, graphController;
    beforeEach(module("find"));

    beforeEach(inject(function ($injector, $controller) {
        $httpBackend = $injector.get("$httpBackend");
        graphController = $controller("graphController");
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("can initialise with all profiles",
        function () {
            graphController.skills = [];
            $httpBackend.expectGET("/api/skill").respond(profileData);
            $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
            $httpBackend.flush();
            expect(graphController.force.links.length).toBe(38);
            expect(graphController.force.nodes.length).toBe(30);
        });

    it("can filter by skills",
      function () {
          graphController.skill = "one";
          graphController.addSkill();
          expect(graphController.skills.length).toEqual(1);
          $httpBackend.expectGET("/api/skill").respond(profileData);
          $httpBackend.expectPOST("/api/skill").respond(profileData);
          $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
          $httpBackend.flush();
          expect(graphController.force.links.length).toBe(38);
          expect(graphController.force.nodes.length).toBe(30);
      });
});

describe("listSkillsController",
    function () {
        var $httpBackend, controller;
        beforeEach(module("find"));

        beforeEach(inject(function ($injector, $controller) {
            $httpBackend = $injector.get("$httpBackend");
            controller = $controller("listSkillsController");
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("lists skills",
            function () {
                $httpBackend.expectGET("/api/skill").respond(profileData);
                $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                $httpBackend.flush();
                expect(controller.list.length).toBe(15);
            });
    });

describe("createController",
    function () {
        var $httpBackend, controller, $location;
        beforeEach(module("find"));

        beforeEach(inject(function ($injector, $controller, _$location_) {
            $httpBackend = $injector.get("$httpBackend");
            controller = $controller("createController");
            $location = _$location_;
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("can create a profile",
            function () {
                controller.data =  {
                    user: {},
                    ou: {},
                    skills: []
                };
                controller.create();
                $httpBackend.expectPOST("/api/profile").respond();
                $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                $httpBackend.expectGET("/Scripts/app/partials/profiles.html").respond();
                $httpBackend.flush();

                expect($location.path()).toBe("/profiles");
            });
    });

describe("editController",
    function () {
        var $httpBackend, controller, $location;
        beforeEach(module("find"));

        beforeEach(inject(function ($injector, $controller, _$location_) {
            $httpBackend = $injector.get("$httpBackend");
            controller = $controller("editController");
            $routeParams = {};
            $location = _$location_;
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("can get a profile from id",
            function () {
                var data = {
                    user: {name: "test"},
                    ou: {name: "test"},
                    skills: [{name: "test"}]
                };
                $routeParams.id = "test";

                $httpBackend.expectGET("/api/profile").respond(data);
                $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                $httpBackend.flush();

                expect(controller.data.user.name).toBe("test");
            });

        it("can put an edited profile",
           function () {
               var data = {
                   user: { name: "test" },
                   ou: { name: "test" },
                   skills: [{ name: "test" }]
               };
               $routeParams.id = "test";

               controller.update();
               $httpBackend.expectGET("/api/profile").respond(data);
               $httpBackend.expectPUT("/api/profile").respond();
               $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
               $httpBackend.expectGET("/Scripts/app/partials/profiles.html").respond();
               $httpBackend.flush();

               expect(controller.data.user.name).toBe("test");
               expect($location.path()).toBe("/profiles");
           });
    });

describe("deleteController",
    function () {
        var $httpBackend, controller, $location;
        beforeEach(module("find"));

        beforeEach(inject(function ($injector, $controller, _$location_) {
            $httpBackend = $injector.get("$httpBackend");
            controller = $controller("deleteController");
            $routeParams = {};
            $location = _$location_;
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("can get a profile from id",
            function () {
                var data = {
                    user: { name: "test" },
                    ou: { name: "test" },
                    skills: [{ name: "test" }]
                };
                $routeParams.id = "test";

                $httpBackend.expectGET("/api/profile").respond(data);
                $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
                $httpBackend.flush();

                expect(controller.data.user.name).toBe("test");
            });

        it("can delete a profile",
           function () {
               var data = {
                   user: { name: "test" },
                   ou: { name: "test" },
                   skills: [{ name: "test" }]
               };
               $routeParams.id = "test";

               controller.delete();
               $httpBackend.expectGET("/api/profile").respond(data);
               $httpBackend.expectDELETE("/api/profile").respond();
               $httpBackend.expectGET("/Scripts/app/partials/graph.html").respond();
               $httpBackend.expectGET("/Scripts/app/partials/profiles.html").respond();
               $httpBackend.flush();

               expect($location.path()).toBe("/profiles");
           });
    });