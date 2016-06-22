(function() {
    'use strict';

    angular
        .module('sdhacks')
        .controller('fooCtrl', fooCtrl);

    fooCtrl.$inject =['$log','$location','apiService','apiFactoryFoo', 'fooData'];

    function fooCtrl($log, $location, apiService, apiFactoryFoo, fooData){
        var foo = this;
        foo.global = apiService;
        foo.name = "AngularJS";
        foo.data = fooData;
    }
})();
