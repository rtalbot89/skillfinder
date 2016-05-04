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
        .when('/graph', {
            templateUrl: '/Scripts/app/partials/graph.html',
            controller: 'graphController',
            controllerAs: 'graph'
        })
      .otherwise({ redirectTo: '/' });
   })
.controller("homeController", function ($http) {
    var profiles = this;
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
        $http.get('/api/skillsearch/', { params: { id: profiles.skill } }).then(
       function (result) {

           profiles.searchResults = result.data;

           profiles.searchResults.forEach(function (p) {
               p.Skills.push(p.qs);
           });
       },
       function () {
           console.log("failed");
       });
    }
})
.controller("graphController", function ($http) {
    var graph = this;
    graph.filters = [];
    graph.skill = "";
    graph.flag = false;
   
    graph.setNodes = function () {
        graph.flag = false;
        if (graph.skill !== "") {
            graph.filters.push(graph.skill);
            graph.skill = "";
        }

        $http.post("/api/skillsearch", graph.filters)
        .then(
        function (result) {
            graph.force = {};
            graph.force.nodes = [];
            graph.force.links = [];
            var index = 0;
            var nodeTracker = [];
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
        graph.filters.push(graph.skill);
        setNodes();
        graph.skill = "";
    };
})
.directive("skillgraph", function () {
    function dlink(scope, element, attrs) {
        var width = 500,
        height = 400;
        var color = d3.scale.category20();
        var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height);

        scope.$watch(function (attrs) {
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

            //console.log(links);
            //console.log(nodes);
            /*
            force
                .nodes(nodes)
                .links(links)
                .start();
                */
            /*
            var drag = force.drag()
                .on("dragstart", dragstart);
            */

            var link = svg.selectAll(".link");
               // .data(links)
               // .enter().append("line")
               // .attr("class", "link");
            //.style("stroke-width", 1);

            var node = svg.selectAll(".node");
               // .data(nodes)
                //.enter().append("circle")
                //  .enter().append("g")
               // .attr("class", "node")
               // .style("fill", function (d) {
               //     if (d.type === "user") {
               //         return "#5731F2";
               //     }

               //     return "#30B5FF";

               // })
                //.attr("r", 10)
                /*
                .style("fill", function (d) {
                   
                    return color(d);
                })
                */
                //.call(force.drag);
           

            //node.append("circle")
            //.attr("r", 16);

            function start() {
                link = link.data(force.links(), function (d) { return d.source + "-" + d.target; });

                link.enter().insert("line", ".node").attr("class", "link");
                link.exit().remove();

                node = node.data(force.nodes(), function (d) { return d.id; });
                node.enter().append("circle").attr("class", function (d) { return "node " + d.id; }).attr("r", 8);
                node.exit().remove();

                force.start();
            }

            var iconType = function (d) {
                if (d.type === "skill") {
                    //console.log(d.type);
                    return "/content/hammer.png";
                }
                return "/content/personicon.png";

            };
            /*
            node.append("image")
                .attr("xlink:href", function (d) { return iconType(d);})
                .attr("x", -8)
                .attr("y", -8)
                .attr("width", 16)
                .attr("height", 16);

            node.append("title")
                .text(function (d) { return d.name; });
                */

            function tick() {
                // nodes[0].x = width / 2;
                // nodes[0].y = height / 2;
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

               // node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });

            }

            start();
            /*
            function dragstart(d) {
                d3.select(this).classed("fixed", d.fixed = true);
            }
            */
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