(function(){
    'use strict';
    angular
        .module('sdhacks', ['ngRoute','ngResource', 'ngAnimate'])
        .config(configApp);
    
    configApp.$inject = ['$httpProvider'];
    
    function configApp($httpProvider){
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    }

})();
