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

           console.log(profiles.searchResults);
       },
       function () {
           console.log("failed");
       });
    }
})
.controller("graphController", function ($http) {
    var graph = this;
    $http.get("/api/skillsearch")
    .then(
    function (result) {
       // console.log(result.data);
        graph.force = {};
        graph.force.nodes = [];
        graph.force.links = [];
        var index = 0;
        var nodeTracker = [];
        for (var i = 0 ; i < result.data.length; i++) {
            var d = result.data[i];
            nodeTracker.push(d.user.Name);
            var userId = nodeTracker.indexOf(d.user.Name);

            for (var j = 0; j < d.skills.length; j++) {
                var s = d.skills[j];
                if (nodeTracker.indexOf(s.Name) === -1) {
                    nodeTracker.push(s.Name);
                }
                var skillId = nodeTracker.indexOf(s.Name);
                graph.force.links.push({ source: userId, target: skillId });
            }
        }

        nodeTracker.forEach(function (t) {
            graph.force.nodes.push({ name: t });
        });
        /*
        result.data.forEach(function (d) {
            if (nodeTracker.indexOf(d.user.Name) === -1) {
                nodeTracker.push(d.user.Name);
            }
            var userId = nodeTracker.indexOf(d.user.Name);
            d.skills.forEach(function (s) {
                if (nodeTracker.indexOf(s.Name) === -1) {
                    nodeTracker.push(s.Name);
                }

                var skillId = nodeTracker.indexOf(s.Name);
                graph.force.links.push({ source: userId, target: skillId });

            });
            nodeTracker.forEach(function (t) {
                graph.force.nodes.push({ name: t });
            });
        });
        */
       //console.log(graph.force.nodes);
       //console.log(graph.force.links);

    },
    function () {
        console.log("failed");
    }
    );
})
.directive("skillgraph", function () {
    function dlink(scope, element, attrs) {
        console.log("directive runs");
       var width = 500,
       height = 400;
       var color = d3.scale.category20();
        var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height);

        var nodes = [];
        var links = [];

        scope.$watch(function (newVal, oldVal, scope) {
            console.log(oldVal);
         
            if (newVal.links !== undefined && newVal.nodes !== undefined) {
                nodes = [];
                links = [];
                graphStart();
            }
        }, true);

        function graphStart() {
            nodes = scope.nodes;
            links = scope.links;
            //console.log(nodes);

            var force = d3.layout.force()
                .charge(-120)
                .linkDistance(30)
                .size([width, height]);

            console.log(links);
            console.log(nodes);
            force
                .nodes(nodes)
                .links(links)
                .start();
            /*
            var drag = force.drag()
                .on("dragstart", dragstart);
            */

            var link = svg.selectAll(".link")
                .data(links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", 1);

            var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 10)
                /*
                .style("fill", function (d) {
                   
                    return color(d);
                })
                */
                .call(force.drag);
            /*
            node.append("title")
                .text(function (d) { return d; });
                */

            force.on("tick", function () {
                // nodes[0].x = width / 2;
                // nodes[0].y = height / 2;
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });

            });
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
            links: '=links'
        },
        templateUrl: '/scripts/app/partials/force.html',
        link: dlink
    };


});