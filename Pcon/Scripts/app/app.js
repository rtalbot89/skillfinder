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