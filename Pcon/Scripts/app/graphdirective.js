angular.module("find")
    .directive("skillgraph", function () {

        var textColour = "rgb(255, 255, 196)";
        var style = {
            user: { circleFill: "rgb(255, 64, 0)", icon: "\uf007", fontColour: textColour },
            ou: { circleFill: "rgb(163, 26, 255)", icon: "\uf1ad", fontColour: textColour },
            skill: { circleFill: "rgb(51, 102, 255)", icon: "\uf0ad", fontColour: textColour }
        };

        function dlink(scope, element) {
            var svg = d3.select(element[0])
                .append("div")
                .classed("svg-container", true) //container class to make it responsive
                .append("svg")
                //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 730 440")
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
                    .size([parseInt(svg.style("width"), 10), parseInt(svg.style("height"), 10)])
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