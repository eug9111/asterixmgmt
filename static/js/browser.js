'use strict'
// Browser.js
angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/browse', {
    templateUrl: '/partials/browser.html',
    controller: 'BrowseController'
  });
}])
.controller('BrowseController', ['$scope', '$location', '$modal', 'asterix', 'types', 'base',
function($scope, $location, $modal, asterix, types, base){
  var A = asterix.db;

  $scope.getPKFields = function(){
    return base.datasets[base.currentDataset].InternalDetails.PrimaryKey.orderedlist;
  };

  $scope.getPKValues = function(record){
    var PKfields = $scope.getPKFields();
    return PKfields.map(function(pk){
      if(typeof record[pk] == 'string'){
        return record[pk];
      }
      else if(asterix.extractNumber(record[pk]) !== false){
        return asterix.extractNumber(record[pk]).toString();
      }
      else{
        return 'Non-simple or unknown Asterix PK type';
      }
    }).filter(function(value){
      return value !== false;
    });
  };

  function reloadData(){
    $scope.browsing.paging.page = 1;
    base.loadRecords($scope.browsing.paging.itemsPerPage, $scope.browsing.paging.page);
  }

  $scope.loadInsertForm = function(){
    var modal = $modal.open({
      templateUrl:'/partials/insertRowForm.html',
      controller: 'InsertRowController',
      controllerAs: 'InsertRowController',
      resolve: {
        targetType: function(){
          return base.datasets[base.currentDataset].DataTypeName;
        },
      },
      size: 'lg'
    });

    modal.result.then(reloadData, function(reason){
      if(typeof reason == 'object' && reason.hasOwnProperty('asterixError')){
        alert(reason.asterixError);
      }
    });
  };

  $scope.loadLoadForm = function(){
    var modal = $modal.open({
      templateUrl: '/partials/loadDataForm.html',
      controller: 'LoadDataController',
      size: 'lg'
    });

    modal.result.then(reloadData);
  };

  $scope.deleteRecord = function(rid)
  {
    var pk = base.datasets[base.currentDataset].InternalDetails.PrimaryKey.orderedlist;
    var record = base.records[rid];
    var pkValue = {};

    for(var k in pk){
      var key = pk[k];
      pkValue[key] = record[key];
    }

    asterix.del(base.currentDataverse, base.currentDataset, pkValue).then(function(){
      base.loadRecords($scope.browsing.paging.itemsPerPage, $scope.browsing.paging.page);
    });
  };

  $scope.magnifyRecord = function (rid){
    $location.path('/row/' + rid);
  };
}])
.controller('InsertRowController', ['$scope', 'asterix', 'base', 'types', 'targetType',
function($scope, asterix, base, types, typeName){
  this.type = typeName;
  this.value = {};

  this.alerts = [];

  this.doInsert = function(closeAfter){
    var ctrl = this;
    asterix.insert(base.currentDataverse, base.currentDataset, this.value).then(function(){
      if(closeAfter){
        $scope.$close(true);
      }
      else{
        ctrl.alerts.push({type: 'success', msg: 'Successfully inserted row'});
        ctrl.clearForm();
      }
    }, function(err){
      $scope.$dismiss(err);
    })
  };

  this.closeAlert = function(index){
    this.alerts.splice(index, 1);
  }

  this.clearForm = function(){
    $('.insert-field, .insert-field-extra').val('');
  }
}])
.controller('LoadDataController', ['$scope', 'asterix', function($scope, Asterix){

}]);
