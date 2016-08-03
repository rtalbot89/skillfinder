angular.module("find")
    .directive("ous", ["typeAhead", function (typeAhead) {

        return {
            restrict: "E",
            scope: {
                ou: "=ou"
            },
            templateUrl: "/Scripts/app/partials/ous.html",
            link: function (scope) {
                scope.getOu = function (val) {
                    return typeAhead.ou(val);
                };
            }
        };
    }])
    .directive("skills", ["typeAhead", "skillArray", function (typeAhead, skillArray) {

        return {
            restrict: "E",
            scope: {
                skills: "=skillList"
            },
            templateUrl: "/Scripts/app/partials/skills.html",
            link: function (scope) {
                scope.removeSkill = function (index) {
                    scope.skills.splice(index, 1);
                };

                scope.addSkill = function () {
                    skillArray.add(scope.skills, scope.skill);
                    scope.skill = "";
                    scope.noResults = false;
                };

                scope.getSkill = function (val) {
                    return typeAhead.skill(val);
                };
            }
        };
    }]);