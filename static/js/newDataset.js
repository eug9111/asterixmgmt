angular.module('asterface')
/*
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/newdataset', {
    templateUrl:  '/partials/datasetform.html',
    controller: 'NewDatasetController'
  });
}])
*/
.controller('NewDatasetController', ['$scope', '$location', '$modalInstance', 'asterix', 'base',
function($scope, $location, $modalInstance, asterix, base){
  $scope.datasetForm = {
    primaryKeys: [],
    newPrimaryKey: false
  };

  $scope.datasetForm.addPrimaryKey = function(){
    $scope.datasetForm.primaryKeys.push($scope.datasetForm.newPrimaryKey);
  };

  $scope.datasetForm.removePK = function(pkIndex){
    $scope.datasetForm.primaryKeys.splice(pkIndex, 1);
  };

  $scope.datasetForm.createDataset = function()
  {
    var query = sprintf('create dataset %s (%s) primary key %s',
      $scope.datasetForm['name'],
      $scope.datasetForm['type'],
      $scope.datasetForm.primaryKeys.join(',')
    );

    asterix.ddl(base.currentDataverse, query).then(function(result){
      $modalInstance.close($scope.datasetForm['name']);
    });
  };

  $scope.datasetForm.getFields = function(){
    return base.datatypes[$scope.datasetForm.type].Derived.Record.Fields.orderedlist
  };

  $scope.datasetForm.getTypes = function(){
    var invalidDatasetType = /^(Field_|Type_)/;
    return Object.keys(base.datatypes).filter(function(typeName){
      return !invalidDatasetType.test(typeName);
    });
  };
}]);
