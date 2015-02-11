angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/query', {
    templateUrl: '/partials/query.html',
    controller: 'QueryController',
    controllerAs: 'QueryController',
  });
}])
.controller('QueryController', ['$scope', 'asterix', 'base', function($scope, asterix, base){
  this.history = [];
  this.oldQuery = false;
  this.asterix = asterix;
  var ctrl = this;

  function doQuery(query){
    return asterix.query(base.currentDataverse, query)
    .then(function(results){
      ctrl.results = results;
    });
  }

  this.loadQuery = function(){
    doQuery(this.query).then(function(){
      ctrl.history.push(ctrl.query);
    });
  };

  this.loadHistory = function(){
    doQuery(this.oldQuery);
  };

  $scope.$watch('base.currentDataverse', function(){
    this.history = [];
  });

}]);
