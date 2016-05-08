angular.module("find", ['ngRoute', 'ui.bootstrap'])
   .config(function ($routeProvider, $locationProvider) {
       $routeProvider
       .when("/list", {
           templateUrl: "/Scripts/app/partials/home.html",
           controller: "homeController",
           controllerAs: 'myProfiles'
       })
        .when('/', {
            templateUrl: '/Scripts/app/partials/home.html',
            controller: 'homeController',
            controllerAs: 'profiles'
        })
          .when('/search/:q', {
              templateUrl: '/Scripts/app/partials/home.html',
              controller: 'homeController',
              controllerAs: 'profiles'
          })
        .when('/graph', {
            templateUrl: '/Scripts/app/partials/graph.html',
            controller: 'graphController',
            controllerAs: 'graph'
        })
            .when('/skills', {
                templateUrl: '/Scripts/app/partials/browseskills.html',
                controller: 'listSkillsController',
                controllerAs: 'skills'
            })
      .otherwise({ redirectTo: '/' });
   })
.controller("homeController", function ($http, $routeParams, $filter, $scope) {
    var profiles = this;
    profiles.tags = [];
    profiles.tagButtons = [];
    profiles.getLocation = function (val) {
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

    profiles.searchSkills = function () {
        profiles.tagButtons = [];
        if (profiles.skill !== "" && profiles.tags.indexOf(profiles.skill) === -1) {
            profiles.tags.push(profiles.skill);
        }

        profiles.tagButtons = profiles.tags;

        $http.post('/api/skillsearch', profiles.tags).then(
       function (result) {
           profiles.searchResults = result.data;
           profiles.skill = "";
       },
       function () {
           console.log("failed");
       });
    };

    if ($routeParams.q) {
        profiles.skill = $routeParams.q;
        profiles.searchSkills();
    }

    profiles.removeTag = function (index, tag) {
        profiles.skill = "";
        profiles.tags = $filter('filter')(profiles.tags, function (d) { return d !== tag; });
        if (profiles.tags.length > 0) {
            profiles.searchSkills();
        } else {
            profiles.searchResults = [];
        }
    };
})
.controller("graphController", function ($http) {
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

        $http.post("/api/skillsearch", graph.filters)
        .then(
        function (result) {
            //console.log(result.data);
            graph.force = {};
            graph.force.nodes = [];
            graph.force.links = [];
            var index = 0;
            var nodeTracker = [];

            // Only do this if showing the whole thing
            if (graph.filters.length === 0) {
                for (var i = 0 ; i < result.data.length; i++) {
                    var d = result.data[i];
                    nodeTracker.push({ user: d.user.Name });
                    var userId = nodeTracker.length - 1;

                    for (var j = 0; j < d.skills.length; j++) {
                        var s = d.skills[j];
                        var skillId;
                        var hasId = nodeTracker.map(function (e) { return e.skill; }).indexOf(s.Name);
                        if (hasId === -1) {
                            nodeTracker.push({ skill: s.Name });
                            skillId = nodeTracker.length - 1;
                        } else {
                            skillId = hasId;
                        }
                        graph.force.links.push({ source: userId, target: skillId });
                    }
                }
            }

            // do this if there are filters
            if (graph.filters.length > 0) {
                for (var i = 0 ; i < result.data.length; i++) {
                    var d = result.data[i];
                    nodeTracker.push({ user: d.user.Name });
                    var userId = nodeTracker.length - 1;
                    for (var m = 0; m < d.skills.length; m++) {
                        if (graph.filters.indexOf(d.skills[m].Name) !== -1) {
                            var s = d.skills[m];
                            var skillId;
                            var hasId = nodeTracker.map(function (e) { return e.skill; }).indexOf(s.Name);
                            if (hasId === -1) {
                                nodeTracker.push({ skill: s.Name });
                                skillId = nodeTracker.length - 1;
                            } else {
                                skillId = hasId;
                            }
                            graph.force.links.push({ source: userId, target: skillId });
                        }
                    }
                }
            }

            var nid = 0;
            nodeTracker.forEach(function (t) {
                if (t.user !== undefined) {
                    graph.force.nodes.push({ name: t.user, type: "user", id: nid });
                }
                if (t.skill !== undefined) {
                    graph.force.nodes.push({ name: t.skill, type: "skill", id: nid });
                }
                nid++;
            });
            graph.flag = true;
        },
        function () {
            console.log("failed");
        }
        );
    };

    graph.setNodes();

    graph.getLocation = function (val) {
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

    graph.addFilter = function () {
        if (graph.filters.indexOf(graph.skill) === -1) {
            graph.filters.push(graph.skill);
            setNodes();
        }
        graph.skill = "";
    };
    graph.removeFilter = function (filter) {
        //console.log(filter);
        graph.filters.splice(graph.filters.indexOf(filter), 1);
        graph.setNodes();

    };
})
.controller("listSkillsController", function ($http) {
    var skills = this;
    skills.list = [];
    skills.count = {};
    $http.get('/api/skillsearch/').then(
    function (result) {
        //console.log(result.data);
        result.data.forEach(function (d) {
            d.skills.forEach(function (s) {
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
        console.log(skills.list);
        console.log(skills.count);
    },
    function () {
        console.log("failed");
    });
})
.directive("skillgraph", function () {
    function dlink(scope, element, attrs) {
        var width = 600,
        height = 350;
        var color = d3.scale.category20();
        /*
        var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height);
            */

        var svg = d3.select(element[0])
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 900 360")
        //class to make it responsive
        .classed("svg-content-responsive", true);

        scope.$watch(function (attrs) {
            if (scope.links !== undefined && scope.nodes !== undefined && scope.flag === true) {
                graphStart();
            }
        });

        function graphStart() {
            scope.flag = false;
            nodes = scope.nodes;
            links = scope.links;

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
                link = link.data(force.links(), function (d) { return d.source + "-" + d.target; });
                link.enter().insert("line", ".node").attr("class", "link");
                link.exit().remove();

                node = node.data(force.nodes(), function (d) { return d.id; });
                var group = node.enter().append("g").attr("class", function (d) { return "node " + d.id; });
                group.call(force.drag);

                group.append("circle").attr("r", 10).attr("fill", function (d) {
                    if (d.type === "user") {
                        return "#5731F2";
                    }
                    return "#30B5FF";
                });

                group.append("image")
                .attr("xlink:href", function (d) { return iconType(d); })
                .attr("x", -10)
                .attr("y", -10)
                .attr("width", 20)
                .attr("height", 20)
                .append("title").text(function (d) { return d.name; });

                node.exit().remove();

                force.start();
            }

            var iconType = function (d) {
                if (d.type === "skill") {
                    return "/content/hammer-circle.png";
                }
                return "/content/person-circle.png";
            };

            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

                /*
                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
                    */
            }

            start();
        }
    }

    return {
        restrict: 'E',
        scope: {
            nodes: '=nodes',
            links: '=links',
            flag: '=flag'
        },
        link: dlink
    };
})
    .factory("AutoSk", function ($resource) {
        return $resource("/api/autoskills:id", { id: "@id" });
    });