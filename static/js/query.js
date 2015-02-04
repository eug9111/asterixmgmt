angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/query', {
    templateUrl: '/partials/query.html',
    controller: 'QueryController'
  });
}])
.controller('QueryController', ['$scope', 'asterix', 'base', function($scope, asterix, base){
  $scope.query = {};
  $scope.query.history = [];
  $scope.query.oldQuery = false;
  $scope.asterix = asterix;

  function doQuery(query){
    return asterix.query(base.currentDataverse, query)
    .then(function(results){
      $scope.query.results = results;
    });
  }

  $scope.query.loadQuery = function(){
    doQuery($scope.query.txt).then(function(){
      $scope.query.history.push($scope.query.txt);
    });
  };

  $scope.query.loadHistory = function(){
    doQuery($scope.query.oldQuery);
  };

  $scope.$watch('base.currentDataverse', function(){
    $scope.query.history = [];
  });

}]);
