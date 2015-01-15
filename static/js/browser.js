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
.controller('InsertRowController', ['$scope', 'asterix', 'base', 'types',
function($scope, asterix, base, types){
  var typeName = base.datasets[base.currentDataset].DataTypeName;
  var type = base.datatypes[typeName];

  $scope.insert = {
    extraFields: [],
    newField: {},
    isOpen: type.Derived.Record.IsOpen,
    fields: type.Derived.Record.Fields.orderedlist,
    afFields: []
  };

  $scope.alerts = [];

  $scope.getExtraFields = function(fields, exclude){
    var result = {}
    for(var field in fields){
      if(fields.hasOwnProperty(field)){
        result[field] = true;
      }
    }

    for(var i in exclude) {
      delete result[exclude[i].FieldName];
    }

    return result;
  };

  $scope.addField = function(){
    $scope.insert.extraFields.push({
      FieldName: $scope.insert.newField.Name,
      FieldType: $scope.insert.newField.Type
    });
  };

  $scope.registerField = function(childScope){
    $scope.insert.afFields.push(childScope);
  };

  $scope.doInsert = function(closeAfter){
    var record = {};
    $scope.insert.afFields.forEach(function(scope){
      record[scope.name] = scope.getValue();
    });

    asterix.insert(base.currentDataverse, base.currentDataset, record).then(function(){
      if(closeAfter){
        $scope.$close(true);
      }
      else{
        $scope.alerts.push({type: 'success', msg: 'Successfully inserted row'});
        $scope.clearForm();
      }
    }, function(err){
      $scope.$dismiss(err);
    })
  };

  $scope.closeAlert = function(index){
    $scope.alerts.splice(index, 1);
  }

  $scope.clearForm = function(){
    $('.insert-field, .insert-field-extra').val('');
  }
}])
.controller('LoadDataController', ['$scope', 'asterix', function($scope, Asterix){

}]);
