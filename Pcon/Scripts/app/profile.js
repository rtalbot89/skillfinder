angular.module("find")
.controller("profileController", function (profileApi) {
    var profiles = this;
    profiles.list = profileApi.query();
})
.controller("createController", function ($location, profileApi) {
    var myProfile = this;
    myProfile.data = {
        User: {},
        Ou: {},
        Skills: []
    };

    myProfile.update = function () {
        profileApi.save(myProfile.data, function () {
            $location.path("/profiles");
        });
    };
})
.controller("viewController", function ($http, $routeParams) {
    var viewProfile = this;
    $http.get("/api/neo4j/" + $routeParams.id).then(
        function (result) {
            viewProfile.data = result.data[0];
            viewProfile.data.Skills.sort();
        },
        function () {
            alert("failed");
        });
})
.controller("viewMyController", function ($http) {
    var viewProfile = this;
    $http.get("/api/neomyprofile/").then(
        function (result) {
            if (result.data.length === 0) {
                viewProfile.isProfile = false;
            }
            else {
                viewProfile.data = result.data[0];
                viewProfile.skills = viewProfile.data.Skills.map(function (s) { return s.Name; }).sort();
                viewProfile.isProfile = true;
            }
        },
        function () {
            console.log("failed");
        });
})
.controller("editController", function ($routeParams, $location, profileApi) {
    var editProfile = this;
    editProfile.data = profileApi.get({ id: $routeParams.id });

    editProfile.update = function () {
        profileApi.update(editProfile.data,
            function () {
                $location.path("/profiles");
            });
    };

    editProfile.cancel = function () {
        $location.path("/profiles");
    };
})
.controller("deleteController", function ($routeParams, $location, profileApi) {
    var deleteProfile = this;
    deleteProfile.data = profileApi.get({ id: $routeParams.id });

        deleteProfile.delete = function() {
            profileApi.remove({ id: $routeParams.id }, function() {
                $location.path("/profiles");
            });
        };

        deleteProfile.cancel = function() {
            $location.path("/profiles");
        };
    })
.factory("profileApi", ["$resource", function ($resource) {
    return $resource("/api/neomyprofile", null,
        {
            "update": { method: "PUT" }
        });
}])
.directive("ous", function ($http) {
    return {
        restrict: "E",
        scope: {
            ou: "=ou"
        },
        templateUrl: "/Scripts/app/partials/ous.html",
        link: function (scope) {
            scope.getLocation = function (val) {
                return $http.get("/api/autoorg",
                    {
                        params: {
                            query: val
                        }
                    })
                    .then(function (response) {
                        return response.data.map(function (item) {
                            return item.Name;
                        });
                    });
            };
        }
    };
})
.directive("skills", function ($http) {

    return {
        restrict: "E",
        scope: {
            skills: "=skillList"
        },
        templateUrl: "/Scripts/app/partials/skills.html",
        link: function (scope) {
            scope.removeSkill = function (skill) {
                scope.skills.splice(scope.skills.indexOf(skill), 1);
            };

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            scope.addSkill = function () {
                var exists = false;
                if (scope.skill === "" || scope.skill === undefined) {
                    return;
                }
                scope.skill = capitalizeFirstLetter(scope.skill);
                // ensure we aren't trying to add duplicates to a profile
                for (var i = 0; i < scope.skills.length; i += 1) {
                    if (scope.skills[i].Name === scope.skill) {
                        exists = true;
                        break;
                    }
                }

                if (exists === false) {
                    scope.skills.push({ Name: scope.skill });
                }

                scope.skill = "";
                scope.noResults = false;
            };

            scope.getLocation = function (val) {
                return $http.get("/api/autoskills", {
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