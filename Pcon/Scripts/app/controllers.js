angular.module("find")
    .controller("listController", ["$routeParams", "typeAhead", "skillApi", "skillArray", function ($routeParams, typeAhead, skillApi, skillArray) {
        var profiles = this;
        profiles.skills = [];

        profiles.getSkill = function (val) {
            return typeAhead.skill(val);
        };

        function getResults() {
            profiles.searchResults = skillApi.search(profiles.skills, function (data) {
                data.forEach(function (profile) {
                    profile.skillString = skillArray.flatten(profile.skills);
                });
            });
        }

        profiles.addSkill = function () {
            if (profiles.skills.indexOf(profiles.skill) === -1) {
                profiles.skills.push(profiles.skill);
                getResults();
            }
            profiles.skill = "";
        };

        // Search from a link
        if ($routeParams.q) {
            profiles.skill = $routeParams.q;
            profiles.skills.push(profiles.skill);
            getResults();
            profiles.skill = "";
        }

        profiles.removeSkill = function (index) {

            profiles.skills.splice(index, 1);

            if (profiles.skills.length > 0) {
                getResults();
            } else {
                profiles.searchResults = [];
            }
        };
    }])
    .controller("graphController", ["dbNode", "typeAhead", function (dbNode, typeAhead) {
        var graph = this;
        graph.skills = [];

        graph.setNodes = function () {
            if (graph.skills.length > 0) {
                dbNode.filterBySkill(graph);
            } else {
                dbNode.allBySkill(graph);
            }
        };

        graph.setNodes();

        graph.getSkill = function (val) {
            return typeAhead.skill(val);
        };

        graph.addSkill = function () {
            if (graph.skills.indexOf(graph.skill) === -1) {
                graph.skills.push(graph.skill);
                graph.setNodes();
            }
            graph.skill = "";
        };

        graph.removeSkill = function (index) {
            graph.skills.splice(index, 1);
            graph.setNodes();
        };
    }])
    .controller("listSkillsController", ["skillApi", "arrayFunc", function (skillApi, arrayFunc) {
        var skills = this;

        skillApi.query(function (data) {
            skills.list = arrayFunc.skillCount(data);
        });
    }])
    .controller("profileController", ["profileApi", "skillArray", function (profileApi, skillArray) {
        var profiles = this;
        profiles.list = profileApi.query(
        // Because it's easier to display flatten the skills
        function (data) {
            data.forEach(function (d) {
                d.skillString = skillArray.flatten(d.skills);
            });
        });
    }])
    .controller("createController", ["$location", "profileApi", function ($location, profileApi) {
        var createProfile = this;
        createProfile.data = {
            user: {},
            ou: {},
            skills: []
        };

        createProfile.create = function () {
            profileApi.save(createProfile.data, function () {
                $location.path("/profiles");
            });
        };

        createProfile.cancel = function () {
            $location.path("/profiles");
        };
    }])
    .controller("editController", ["$routeParams", "$location", "profileApi", function ($routeParams, $location, profileApi) {
        var editProfile = this;
        editProfile.data = profileApi.get({ id: $routeParams.id });

        editProfile.update = function () {
            profileApi.update(editProfile.data, function () {
                $location.path("/profiles");
            });
        };

        editProfile.cancel = function () {
            $location.path("/profiles");
        };
    }])
    .controller("deleteController", ["$routeParams", "$location", "profileApi", "skillArray", function ($routeParams, $location, profileApi, skillArray) {
        var deleteProfile = this;
        deleteProfile.data = profileApi.get({ id: $routeParams.id }, function (d) {
            d.skillString = skillArray.flatten(d.skills);
        });

        deleteProfile.delete = function () {
            profileApi.remove({ id: $routeParams.id }, function () {
                $location.path("/profiles");
            });
        };

        deleteProfile.cancel = function () {
            $location.path("/profiles");
        };
    }]);