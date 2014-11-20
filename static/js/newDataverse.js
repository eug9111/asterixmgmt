angular.module('asterface')
.controller('NewDataverseController', ['$scope', 'asterix', function($scope, asterix){
  $scope.createDataverse = function(){
    asterix.ddl(sprintf('create dataverse %s', $scope.dataverseName)).then(function(){
      $scope.$close($scope.dataverseName);
    });

  };
}])
