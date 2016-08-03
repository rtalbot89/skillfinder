angular.module("find")
    .factory("typeAhead", ["$http", function ($http) {
        function responseMap(data) {
            return data.map(function (item) { return item.Name; });
        }
        function skill(val) {
            return $http.get("/api/autoskills", { params: { query: val } })
                .then(function (response) {
                    return responseMap(response.data);
                });
        }

        function ou(val) {
            return $http.get("/api/autoorg", { params: { query: val } })
               .then(function (response) {
                   return responseMap(response.data);
               });
        }
        return {
            skill: skill,
            ou: ou
        };
    }])
    .factory("profileApi", ["$resource", function ($resource) {
        return $resource("/api/neomyprofile",
            null,
            {
                "update": { method: "PUT" }
            });
    }])
    .factory("skillApi", ["$resource", function ($resource) {
        return $resource("/api/skillsearch", null,
        {
            "search": { method: "POST", isArray: true }
        });
    }])
    .factory("arrayFunc", function () {
        return {
            hasValue: function (myArray, searchTerm, type) {
                for (var i = 0, len = myArray.length; i < len; i++) {
                    if (myArray[i].type === type && myArray[i].name === searchTerm) {
                        return myArray[i].id;
                    }
                }
                return -1;
            },
            skillCount: function(data) {
                var tmpObj = {};
                for (var i = 0; i < data.length; i += 1) {
                    for (var j = 0; j < data[i].skills.length; j += 1) {
                        if (tmpObj[data[i].skills[j].Name] === undefined) {
                            tmpObj[data[i].skills[j].Name] = 1;
                        } else {
                            tmpObj[data[i].skills[j].Name] += 1;
                        }
                    }
                }
                return Object.keys(tmpObj).map(function (key) { return { name: key, count: tmpObj[key] }; });
            }
        }
    })
    .factory("dbNode", ["arrayFunc", "skillApi", function (arrayFunc, skillApi) {
        function d3Model(data, graph) {
            var i, d, userId, s, skillId, ouId;
            graph.force = {
                nodes: [],
                links: []
            };

            for (i = 0; i < data.length; i++) {
                d = data[i];
                userId = graph.force.nodes.length;
                graph.force.nodes.push({ name: d.user.Name, type: "user", id: userId });

                ouId = arrayFunc.hasValue(graph.force.nodes, d.ou.Name, "ou");
                if (ouId === -1) {
                    ouId = graph.force.nodes.length;
                    graph.force.nodes.push({ name: d.ou.Name, type: "ou", id: ouId });
                }

                graph.force.links.push({ source: userId, target: ouId });

                for (var j = 0; j < d.skills.length; j++) {
                    s = d.skills[j];
                    skillId = arrayFunc.hasValue(graph.force.nodes, s.Name, "skill");
                    if (skillId === -1) {
                        skillId = graph.force.nodes.length;
                        graph.force.nodes.push({ name: s.Name, type: "skill", id: skillId });
                    }
                    graph.force.links.push({ source: userId, target: skillId });
                }
            }
            graph.flag = true;
        }

        function filterBySkill(graph) {
            skillApi.search(graph.skills, function (data) {
                d3Model(data, graph);
            });
        }

        function allBySkill(graph) {
            skillApi.query(function (data) {
                d3Model(data, graph);
            });
        }

        return {
            filterBySkill: filterBySkill,
            allBySkill: allBySkill
        }
    }])
    .factory("skillArray", function () {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function add(skills, skill) {
            var exists = false;
            if (skill === "" || skill === undefined) {
                return;
            }

            skill = capitalizeFirstLetter(skill);
            // ensure we aren't trying to add duplicates
            for (var i = 0; i < skills.length; i += 1) {
                if (skills[i].Name === skill) {
                    exists = true;
                    break;
                }
            }

            if (exists === false) {
                skills.push({ Name: skill });
            }
        }

        function remove(skills, skill) {
            skills.splice(skills.indexOf(skill), 1);
        }
        return {
            add: add,
            remove: remove
        }
    });