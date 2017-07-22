 var app=angular.module("shorten",[]);

  app.controller('shortenController',['$scope', function($scope){
  $scope.urlToShorten = ''; //this is not necessary, could leave blank and angular would auto create it.  For clarity im leaving it in
  }]);
//controller is a mini app
//scope connects html and javascript variables

