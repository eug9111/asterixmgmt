angular.module('test', [])
.directive('afInput', [function(){
  return {
    restrict: 'E',
    templateUrl: 'partials/directives/afInput.html',
    link: function(scope, element, attrs){
      console.log(attrs['type']);
      scope.type = attrs['type'];
    }
  };
}])
