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
  this.queryId = 1;
  var ctrl = this;

  function HistoryItem(options){
    this.query = options.query;
    this.time = options.time;
    this.result = options.result;
    this.id = ctrl.queryId++;

    this.printDate = function(){
      return sprintf("Query completed on %d:%d:%d",
        this.time.getHours(),
        this.time.getMinutes(),
        this.time.getSeconds());
    };
  };

  function doQuery(query){
    return asterix.query(base.currentDataverse, query)
    .then(function(results){
      ctrl.history.push(new HistoryItem({query: query, result: results, time: new Date()}));
    });
  }

  this.loadQuery = function(){
    doQuery(this.query);
  };

  this.loadHistory = function(){
    doQuery(this.oldQuery);
  };

  this.removeHistoryItem = function(index){
    this.history.splice(index, 1);
  }

  $scope.$watch('base.currentDataverse', function(){
    this.history = [];
  });

}]);
