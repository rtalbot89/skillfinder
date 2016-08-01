angular.module("find")
    .directive("skillgraph", function () {

        var style = {
            user: { circleFill: "#00ff00", icon: "\uf007", fontColour: "red" },
            ou: { circleFill: "yellow", icon: "\uf1ad", fontColour: "blue" },
            skill: { circleFill: "blue", icon: "\uf0ad", fontColour: "yellow" }
        };

        function dlink(scope, element) {
            var width = 600, height = 400;

            var svg = d3.select(element[0])
                .append("div")
                .classed("svg-container", true) //container class to make it responsive
                .append("svg")
                //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 700 450")
                 //class to make it responsive
                .classed("svg-content-responsive", true);

            scope.$watch(function () {
                if (scope.flag === true) {
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
                    link = link.data(force.links(), function (d) { return d.source + "-" + d.target; });
                    link.enter().insert("line", ".node").attr("class", "link");
                    link.exit().remove();

                    node = node.data(force.nodes(), function (d) { return d.id; });
                    var group = node.enter().append("g").attr("class", function (d) { return "node " + d.id; });
                    group.append("title").text(function (d) { return d.name; });
                    group.call(force.drag);

                    group.append("circle")
                        .attr("r", 10)
                        .attr("fill", function (d) { return style[d.type].circleFill; });

                    group.append("text")
                        .attr("x", -5)
                        .attr("y", 5)
                        .text(function (d) { return style[d.type].icon; })
                        .attr("fill", function (d) { return style[d.type].fontColour; });

                    node.exit().remove();

                    force.start();
                }

                function tick() {
                    link.attr("x1", function (d) { return d.source.x; })
                        .attr("y1", function (d) { return d.source.y; })
                        .attr("x2", function (d) { return d.target.x; })
                        .attr("y2", function (d) { return d.target.y; });

                    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
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
    });