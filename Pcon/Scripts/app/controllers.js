angular.module("find")
    .controller("homeController", function ($routeParams, $filter, typeAhead, skillApi) {
        var profiles = this;
        profiles.tags = [];

        profiles.getLocation = function (val) {
            return typeAhead.skill(val);
        };

        profiles.searchSkills = function () {
            // Check for duplicate skills
            if (profiles.skill !== "" && profiles.tags.indexOf(profiles.skill) === -1) {
                profiles.tags.push(profiles.skill);
            }
            profiles.searchResults = skillApi.search(profiles.tags);
            profiles.skill = "";
        };

        // Search from a link
        if ($routeParams.q) {
            profiles.skill = $routeParams.q;
            profiles.searchSkills();
        }

        profiles.removeTag = function (index, tag) {
            profiles.skill = "";
            profiles.tags = $filter("filter")(profiles.tags, function (d) { return d !== tag; });
            if (profiles.tags.length > 0) {
                profiles.searchSkills();
            } else {
                profiles.searchResults = [];
            }
        };
    })
    .controller("graphController", function (dbNode, typeAhead) {
        var graph = this;
        graph.filters = [];
        graph.skill = "";
        graph.flag = false;

        graph.setNodes = function () {
            graph.flag = false;
            if (graph.skill !== "" && graph.filters.indexOf(graph.skill) !== -1) {
                graph.skill = "";
                return;
            }

            if (graph.skill !== "") {
                graph.filters.push(graph.skill);
                graph.skill = "";
            }

            if (graph.filters.length > 0) {
                dbNode.filterBySkill(graph);
            } else {
                dbNode.allBySkill(graph);
            }
        };

        graph.setNodes();

        graph.getLocation = function (val) {
            return typeAhead.skill(val);
        };

        graph.addFilter = function () {
            if (graph.filters.indexOf(graph.skill) === -1) {
                graph.filters.push(graph.skill);
                setNodes();
            }
            graph.skill = "";
        };

        graph.removeFilter = function (filter) {
            graph.filters.splice(graph.filters.indexOf(filter), 1);
            graph.setNodes();
        };
    })
    .controller("listSkillsController", function (skillApi, arrayFunc) {
        var skills = this;

        skillApi.query(function (data) {
            skills.list = arrayFunc.skillCount(data);
        });
    })
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
    .controller("editController", function ($routeParams, $location, profileApi) {
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
    })
    .controller("deleteController", function ($routeParams, $location, profileApi) {
        var deleteProfile = this;
        deleteProfile.data = profileApi.get({ id: $routeParams.id });

        deleteProfile.delete = function () {
            profileApi.remove({ id: $routeParams.id }, function () {
                $location.path("/profiles");
            });
        };

        deleteProfile.cancel = function () {
            $location.path("/profiles");
        };
    });