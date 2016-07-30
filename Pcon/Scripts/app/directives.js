angular.module("find")
    .directive("ous",
        function(typeAhead) {

            return {
                restrict: "E",
                scope: {
                    ou: "=ou"
                },
                templateUrl: "/Scripts/app/partials/ous.html",
                link: function(scope) {
                    scope.getLocation = function (val) {
                        return typeAhead.ou(val);
                    };
                }
            };
        })
    .directive("skills",
        function(typeAhead) {

            return {
                restrict: "E",
                scope: {
                    skills: "=skillList"
                },
                templateUrl: "/Scripts/app/partials/skills.html",
                link: function(scope) {
                    scope.removeSkill = function(skill) {
                        scope.skills.splice(scope.skills.indexOf(skill), 1);
                    };

                    function capitalizeFirstLetter(string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }

                    scope.addSkill = function() {
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
                        return typeAhead.skill(val);
                    };
                }
            };
        });