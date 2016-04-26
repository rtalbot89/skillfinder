angular.module("profile", ['ngRoute', 'ui.bootstrap'])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
        .when("/list", {
            templateUrl: "/Scripts/app/partials/home.html",
            controller: "homeController",
            controllerAs: 'myProfiles'
        })
         .when('/create', {
             templateUrl: '/Scripts/app/partials/new.html',
             controller: 'createController',
             controllerAs: 'myProfile'
         })
         .when('/', {
             templateUrl: '/Scripts/app/partials/view.html',
             controller: 'viewMyController',
             controllerAs: 'viewProfile'
         })
          .when('/edit', {
              templateUrl: '/Scripts/app/partials/edit.html',
              controller: 'editController',
              controllerAs: 'editProfile'
          })
       .otherwise({ redirectTo: '/' });
    })
.controller("homeController", function ($http) {
    var myProfiles = this;
    $http.get("/api/neo4j").then(
         function (result) {
             console.log(result.data);
             myProfiles.ouList = result.data;
         },
        function () {
            console.log("failed");
        });
})
.controller("createController", function ($http, $location) {
    var myProfile = this;
    myProfile.skills = ["Dinosaur chasing", "Rock breaking", "Flint axe making"];

    //myProfile.name = "";
    //myProfile.organisation = "The quarry";

    // Autocomplete OU
    myProfile.getLocation = function (val) {
        return $http.get('/api/autoorg', {
            params: {
                query: val
            }
        }).then(function (response) {
            return response.data.map(function (item) {
                return item.Name;
            });
        });
    };

    myProfile.update = function (form) {
        console.log(form);
        var data = {};
        data.Skills = myProfile.skills;
        data.Name = myProfile.name;
        data.Organisation = myProfile.organisation;

        $http.post('/api/neomyprofile', data).then(
            function () {
                $location.path('/view/' + data.Name);
            },
            function () {
                alert("failed");
            }
            );
    };
})
.controller("viewController", function ($http, $routeParams) {
    var viewProfile = this;
    $http.get('/api/neo4j/' + $routeParams.id).then(
        function (result) {
            viewProfile.data = result.data[0];
            viewProfile.data.Skills.sort();
        },
        function () {
            alert("failed");
        });
})
.controller("viewMyController", function ($http, $routeParams) {
    var viewProfile = this;
    $http.get('/api/neomyprofile/').then(
        function (result) {
            if (result.data.length === 0) {
                viewProfile.isProfile = false;
            }
            else {
                viewProfile.data = result.data[0];
                console.log(viewProfile.data);
                //viewProfile.data.Skills.sort();
                viewProfile.skills = viewProfile.data.Skills.map(function (s) { return s.Name }).sort();
                viewProfile.isProfile = true;
            }
        },
        function () {
            console.log("failed");
        });
})
.controller("editController", function ($http, $routeParams, $location, $window) {
    var editProfile = this;
    $http.get('/api/neomyprofile/').then(
        function (result) {
            editProfile.data = result.data[0];
            editProfile.skills = editProfile.data.Skills.map(function (s) { return s.Name; });
            editProfile.skills.sort();
        },
        function () {
            console.log("failed");
        });

    editProfile.update = function () {
        var data = {};
        data.Name = editProfile.data.User.Name;
        data.Organisation = editProfile.data.OU.Name;
        data.skills = editProfile.skills;
        $http.put('/api/neomyprofile', data).then(
            function () {
                $location.path('/view/' + data.Name);
            },
            function () {
                console.log('failed');
            }
        );
    };

    editProfile.cancel = function () {
        $window.history.back();
    };
})
.directive('skills', function ($http) {

    return {
        restrict: 'E',
        scope: {
            skills: '=skillList'
        },
        templateUrl: '/Scripts/app/partials/skills.html',
        link: function (scope, element, attrs) {
            scope.removeSkill = function (skill) {
                scope.skills.splice(scope.skills.indexOf(skill), 1);
            };

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            scope.addSkill = function () {
                // ensure we aren't trying to add duplicates
                if (scope.skills.indexOf(scope.skill) === -1 && scope.skill !== "" && scope.skill !== undefined) {
                    //console.log(scope.skill);
                    scope.skill = capitalizeFirstLetter(scope.skill);
                    scope.skills.push(scope.skill);
                    scope.skills.sort();
                }
                scope.skill = "";
            };

            // Any function returning a promise object can be used to load values asynchronously
            scope.getLocation = function (val) {
                return $http.get('/api/autoskills', {
                    params: {
                        query: val
                    }
                }).then(function (response) {
                    return response.data.map(function (item) {
                        return item.Name;
                    });
                });
            };
        }
    };
});

// Non angualr

