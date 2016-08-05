angular.module("find", ["ngRoute", "ngResource", "ui.bootstrap"])
    .config(function ($routeProvider) {
        $routeProvider
            .when("/",
            {
                templateUrl: "/Scripts/app/partials/graph.html",
                controller: "graphController",
                controllerAs: "graph"
            })
            .when("/find",
            {
                templateUrl: "/Scripts/app/partials/list.html",
                controller: "listController",
                controllerAs: "profiles"
            })

            .when("/skills",
            {
                templateUrl: "/Scripts/app/partials/allskills.html",
                controller: "listSkillsController",
                controllerAs: "skills"
            })
            .when("/find/:q",
            {
                templateUrl: "/Scripts/app/partials/list.html",
                controller: "listController",
                controllerAs: "profiles"
            })
            .when("/profiles",
            {
                templateUrl: "/Scripts/app/partials/profiles.html",
                controller: "profileController",
                controllerAs: "profiles"
            })
            .when("/create",
            {
                templateUrl: "/Scripts/app/partials/create.html",
                controller: "createController",
                controllerAs: "createProfile"
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
    });