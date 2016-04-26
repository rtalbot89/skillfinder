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
           console.log(result);
           profiles.searchResults = result.data;
       },
       function () {
           console.log("failed");
       });
    }
});