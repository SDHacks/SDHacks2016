(function() {
    'use strict';


    angular
        .module('sdhacks')
        .factory('apiFactoryFoo', apiFactoryFoo)
        .service('apiService', apiService);


    apiFactoryFoo.$inject = ['$resource'];

    apiService.$inject = [
        '$log',
        '$location',
        'apiFactoryFoo',
    ];

    function apiFactoryFoo(resource){
        return resource('/api/v1/foo/:id', {}, {'update': { method:'PUT'}}, {'delete': { method:'DELETE'}});
    }

    function apiService($log, $location, apiFactoryFoo){
        return {
            logFoo: logFoo
        };
        
        function logFoo(arg){
            $log.info("Hello", arg);
            return apiFactoryFoo.query({});
        }
    }
})();
