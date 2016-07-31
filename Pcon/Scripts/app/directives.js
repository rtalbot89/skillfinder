angular.module("find")
    .directive("ous", function (typeAhead) {

        return {
            restrict: "E",
            scope: {
                ou: "=ou"
            },
            templateUrl: "/Scripts/app/partials/ous.html",
            link: function (scope) {
                scope.getLocation = function (val) {
                    return typeAhead.ou(val);
                };
            }
        };
    })
    .directive("skills", function (typeAhead, skillArray) {

        return {
            restrict: "E",
            scope: {
                skills: "=skillList"
            },
            templateUrl: "/Scripts/app/partials/skills.html",
            link: function (scope) {
                scope.removeSkill = function (skill) {
                    skillArray.remove(scope.skills, skill);
                };

                scope.addSkill = function () {
                    skillArray.add(scope.skills, scope.skill);
                    scope.skill = "";
                    scope.noResults = false;
                };

                scope.getLocation = function (val) {
                    return typeAhead.skill(val);
                };
            }
        };
    });