angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/row/:rid', {
    templateUrl: '/partials/viewrow.html',
    controller: 'RowController'
  });
}])
.controller('RowController', ['$scope', '$routeParams', 'base', function($scope, $routeParams, base){
  $scope.record = base.records[$routeParams.rid];

  $scope.back = function(){
    window.history.back();
  };
}])
