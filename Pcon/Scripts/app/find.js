angular.module("find", ["ngRoute", "ngResource", "ui.bootstrap"])
    .config(function($routeProvider) {
        $routeProvider
            .when("/find",
            {
                templateUrl: "/Scripts/app/partials/home.html",
                controller: "homeController",
                controllerAs: "profiles"
            })
            .when("/",
            {
                templateUrl: "/Scripts/app/partials/graph.html",
                controller: "graphController",
                controllerAs: "graph"
            })
            .when("/skills",
            {
                templateUrl: "/Scripts/app/partials/browseskills.html",
                controller: "listSkillsController",
                controllerAs: "skills"
            })
            .when("/profiles/:q",
            {
                templateUrl: "/Scripts/app/partials/home.html",
                controller: "homeController",
                controllerAs: "profiles"
            })
            .when("/profiles",
            {
                templateUrl: "/Scripts/app/partials/allprofiles.html",
                controller: "profileController",
                controllerAs: "allProfiles"
            })
            .when("/create",
            {
                templateUrl: "/Scripts/app/partials/new.html",
                controller: "createController",
                controllerAs: "myProfile"
            })
            .when("/myprofile",
            {
                templateUrl: "/Scripts/app/partials/view.html",
                controller: "viewMyController",
                controllerAs: "viewProfile"
            })
            .when("/profiles/:id/edit",
            {
                templateUrl: "/Scripts/app/partials/edit.html",
                controller: "editController",
                controllerAs: "editProfile"
            })
            .when("/profiles/:id/delete",
            {
                templateUrl: "/Scripts/app/partials/delete.html",
                controller: "deleteController",
                controllerAs: "deleteProfile"
            })
            .otherwise({ redirectTo: "/" });
    })
    .controller("homeController",
        function($http, $routeParams, $filter) {
            var profiles = this;
            profiles.tags = [];

            profiles.getLocation = function(val) {
                return $http.get("/api/autoskills",
                    {
                        params: {
                            query: val
                        }
                    })
                    .then(function(response) {
                        return response.data.map(function(item) {
                            return item.Name;
                        });
                    });
            };

            profiles.searchSkills = function() {
                // Check for duplicate skills
                if (profiles.skill !== "" && profiles.tags.indexOf(profiles.skill) === -1) {
                    profiles.tags.push(profiles.skill);
                }

                $http.post("/api/skillsearch", profiles.tags)
                    .then(
                        function(result) {
                            profiles.searchResults = result.data;
                            profiles.skill = "";
                        },
                        function() {
                            console.log("failed");
                        });
            };

            // Search from a link
            if ($routeParams.q) {
                profiles.skill = $routeParams.q;
                profiles.searchSkills();
            }

            profiles.removeTag = function(index, tag) {
                profiles.skill = "";
                profiles.tags = $filter("filter")(profiles.tags, function(d) { return d !== tag; });
                if (profiles.tags.length > 0) {
                    profiles.searchSkills();
                } else {
                    profiles.searchResults = [];
                }
            };
        })
    .controller("graphController",
        function($http) {
            var graph = this;
            graph.filters = [];
            graph.skill = "";
            graph.flag = false;

            graph.setNodes = function() {
                graph.flag = false;
                if (graph.skill !== "" && graph.filters.indexOf(graph.skill) !== -1) {
                    graph.skill = "";
                    return;
                }
                if (graph.skill !== "") {
                    graph.filters.push(graph.skill);
                    graph.skill = "";
                }

                $http.post("/api/skillsearch", graph.filters)
                    .then(
                        function(result) {
                            graph.force = {};
                            graph.force.nodes = [];
                            graph.force.links = [];
                            var nodeTracker = [];
                            // collect the ous to link laste
                            var ous = [];

                            // Only do this if showing the whole thing
                            var i;
                            var d;
                            var userId;
                            var s;
                            var skillId;
                            var hasId;
                            var ouId;
                            //if (graph.filters.length === 0) {
                            for (i = 0; i < result.data.length; i++) {
                                d = result.data[i];
                                nodeTracker.push({ user: d.user.Name });
                                userId = nodeTracker.length - 1;
                                //ous.push(d.ou.Name);
                                var hasOu = nodeTracker.map(function(e) { return e.ou; }).indexOf(d.ou.Name);
                                if (hasOu === -1) {
                                    nodeTracker.push({ ou: d.ou.Name });
                                    ouId = nodeTracker.length - 1;
                                } else {
                                    ouId = hasOu;
                                }

                                graph.force.links.push({ source: userId, target: ouId });

                                for (var j = 0; j < d.skills.length; j++) {
                                    s = d.skills[j];
                                    hasId = nodeTracker.map(function(e) { return e.skill; }).indexOf(s.Name);
                                    if (hasId === -1) {
                                        nodeTracker.push({ skill: s.Name });
                                        skillId = nodeTracker.length - 1;
                                    } else {
                                        skillId = hasId;
                                    }
                                    graph.force.links.push({ source: userId, target: skillId });
                                }
                            }
                            //}

                            // do this if there are filters
                            //if (graph.filters.length > 0) {
                            //    for (i = 0; i < result.data.length; i++) {
                            //        d = result.data[i];
                            //        nodeTracker.push({ user: d.user.Name });
                            //        userId = nodeTracker.length - 1;
                            //        for (var m = 0; m < d.skills.length; m++) {
                            //            if (graph.filters.indexOf(d.skills[m].Name) !== -1) {
                            //                s = d.skills[m];
                            //                hasId = nodeTracker.map(function (e) { return e.skill; }).indexOf(s.Name);
                            //                if (hasId === -1) {
                            //                    nodeTracker.push({ skill: s.Name });
                            //                    skillId = nodeTracker.length - 1;
                            //                } else {
                            //                    skillId = hasId;
                            //                }
                            //                graph.force.links.push({ source: userId, target: skillId });
                            //            }
                            //        }
                            //    }
                            //}

                            var nid = 0;
                            nodeTracker.forEach(function(t) {
                                if (t.user !== undefined) {
                                    graph.force.nodes.push({ name: t.user, type: "user", id: nid });
                                }

                                if (t.ou !== undefined) {
                                    graph.force.nodes.push({ name: t.ou, type: "ou", id: nid });
                                }
                                if (t.skill !== undefined) {
                                    graph.force.nodes.push({ name: t.skill, type: "skill", id: nid });
                                }
                                nid++;
                            });
                            graph.flag = true;
                        },
                        function() {
                            console.log("failed");
                        }
                    );
            };

            graph.setNodes();

            graph.getLocation = function(val) {
                return $http.get("/api/autoskills",
                    {
                        params: {
                            query: val
                        }
                    })
                    .then(function(response) {
                        return response.data.map(function(item) {
                            return item.Name;
                        });
                    });
            };

            graph.addFilter = function() {
                if (graph.filters.indexOf(graph.skill) === -1) {
                    graph.filters.push(graph.skill);
                    setNodes();
                }
                graph.skill = "";
            };
            graph.removeFilter = function(filter) {
                graph.filters.splice(graph.filters.indexOf(filter), 1);
                graph.setNodes();
            };
        })
    .controller("listSkillsController",
        function($http) {
            var skills = this;
            skills.list = [];
            skills.count = {};
            $http.get("/api/skillsearch/")
                .then(
                    function(result) {
                        result.data.forEach(function(d) {
                            d.skills.forEach(function(s) {

                                if (skills.count[s.Name] === undefined) {
                                    skills.count[s.Name] = 1;
                                } else {
                                    skills.count[s.Name] += 1;
                                }

                                if (skills.list.indexOf(s.Name) === -1) {
                                    skills.list.push(s.Name);
                                }
                            });
                        });
                        skills.list.sort();
                    },
                    function() {
                        console.log("failed");
                    });
        })
    .directive("skillgraph",
        function() {

            var iconType = function(d) {
                if (d.type === "skill") {
                    return "\uf0ad";
                }
                if (d.type === "ou") {
                    return "\uf1ad";
                }
                return "\uf007";
            };
            var iconColour = {
                "user": "#00ff00",
                "ou": "yellow",
                "skill": "blue"
            };

            function dlink(scope, element) {
                var width = 600,
                    height = 400;

                var svg = d3.select(element[0])
                    .append("div")
                    .classed("svg-container", true) //container class to make it responsive
                    .append("svg")
                    //responsive SVG needs these 2 attributes and no width and height attr
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 700 450")
                    //class to make it responsive
                    .classed("svg-content-responsive", true);

                scope.$watch(function() {
                    if (scope.links !== undefined && scope.nodes !== undefined && scope.flag === true) {
                        graphStart();
                    }
                });

                function graphStart() {
                    scope.flag = false;

                    var force = d3.layout.force()
                        .nodes(scope.nodes)
                        .links(scope.links)
                        .charge(-120)
                        .linkDistance(50)
                        .size([width, height])
                        .on("tick", tick);

                    d3.selectAll(".node").remove();
                    var link = svg.selectAll(".link");
                    var node = svg.selectAll(".node");

                    function start() {
                        link = link.data(force.links(), function(d) { return d.source + "-" + d.target; });
                        link.enter().insert("line", ".node").attr("class", "link");
                        link.exit().remove();

                        node = node.data(force.nodes(), function(d) { return d.id; });
                        var group = node.enter().append("g").attr("class", function(d) { return "node " + d.id; });
                        group.append("title").text(function(d) { return d.name; });
                        group.call(force.drag);

                        group.append("circle")
                            .attr("r", 10)
                            .attr("fill",
                                function(d) {
                                    if (d.type === "user") {
                                        return "#5731F2";
                                    }
                                    if (d.type === "skill") {
                                        return "yellow";
                                    }

                                    if (d.type === "ou") {
                                        return "green";
                                    }

                                });

                        group.append("text")
                            .attr("x", -5)
                            .attr("y", 5)
                            .text(function(d) { return iconType(d); })
                            .attr("fill", function(d) { return iconColour[d.type]; });


                        node.exit().remove();

                        force.start();
                    }

                    function tick() {
                        link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });

                        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                    }

                    start();
                }
            }

            return {
                restrict: "E",
                scope: {
                    nodes: "=nodes",
                    links: "=links",
                    flag: "=flag"
                },
                link: dlink
            };
        })
    .factory("AutoSk",
        function($resource) {
            return $resource("/api/autoskills:id", { id: "@id" });
        })
    .factory("arrayFunc",
        function () {
            return {
                indexOf : function (myArray, searchTerm, property) {
                    for (var i = 0, len = myArray.length; i < len; i++) {
                        if (myArray[i][property] === searchTerm) return i;
                    }
                    return -1;
                }
            }
        });