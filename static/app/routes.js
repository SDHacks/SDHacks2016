(function(){
    'use strict';

    angular
        .module('sdhacks')
        .config(config);
        
    config.$inject = ['$routeProvider', '$locationProvider'];
    
    function config($routeProvider, $locationProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/spa',{
                templateUrl: 'ng-partials/index',
                controller: 'fooCtrl',
                controllerAs: 'foo',
                resolve:{
                    fooData: fooData
                }
            })
            .otherwise({
                templateUrl: 'ng-partials/404'
            });
    }

    fooData.$inject = ['apiService'];
    function fooData(apiService){
        return apiService.logFoo('foo');
    }
})();
