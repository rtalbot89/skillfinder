angular.module("find")
    .controller("listController", ["$routeParams", "typeAhead", "skillApi", function ($routeParams, typeAhead, skillApi) {
        var profiles = this;
        profiles.skills = [];

        profiles.getSkill = function (val) {
            return typeAhead.skill(val);
        };

        profiles.addSkill = function () {
            if (profiles.skills.indexOf(profiles.skill) === -1) {
                 profiles.skills.push(profiles.skill);
                 profiles.searchResults = skillApi.search(profiles.skills);
            }
            profiles.skill = "";
        };

        // Search from a link
        if ($routeParams.q) {
            profiles.skill = $routeParams.q;
            profiles.skills.push(profiles.skill);
            profiles.searchResults = skillApi.search(profiles.skills);
            profiles.skill = "";
        }

        profiles.removeSkill = function (index) {

            profiles.skills.splice(index, 1);

            if (profiles.skills.length > 0) {
                profiles.searchResults = skillApi.search(profiles.skills);
            } else {
                profiles.searchResults = [];
            }
        };
    }])
    .controller("graphController",[ "dbNode", "typeAhead", function (dbNode, typeAhead) {
        var graph = this;
        graph.skills = [];
        graph.skill = "";
      
        var setNodes = function () {
            if (graph.skills.length > 0) {
                dbNode.filterBySkill(graph);
            } else {
                dbNode.allBySkill(graph);
            }
        };

        setNodes();

        graph.getSkill = function (val) {
            return typeAhead.skill(val);
        };

        graph.addSkill = function () {
            if (graph.skills.indexOf(graph.skill) === -1) {
                graph.skills.push(graph.skill);
                setNodes();
            }
            graph.skill = "";
        };

        graph.removeSkill = function (index) {
            graph.skills.splice(index, 1);
            setNodes();
        };
    }])
    .controller("listSkillsController",[ "skillApi", "arrayFunc", function (skillApi, arrayFunc) {
        var skills = this;

        skillApi.query(function (data) {
            skills.list = arrayFunc.skillCount(data);
        });
    }])
    .controller("profileController", ["profileApi", function (profileApi) {
        var profiles = this;
        profiles.list = profileApi.query(
        // Because it's easier to display flatten the skills
        function (data) {
            data.forEach(function(d) {
                d.skillString = d.Skills.map(function (s) { return s.Name }).sort().join(", ");
            });
        });
    }])
    .controller("createController", ["$location", "profileApi", function ($location, profileApi) {
        var createProfile = this;
        createProfile.data = {
            User: {},
            Ou: {},
            Skills: []
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
    .controller("deleteController", ["$routeParams", "$location", "profileApi", function ($routeParams, $location, profileApi) {
        var deleteProfile = this;
        deleteProfile.data = profileApi.get({ id: $routeParams.id }, function(d) {
            d.skillString = d.Skills.map(function(s) { return s.Name }).sort().join(", ");
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