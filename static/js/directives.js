angular.module('asterface')
.directive('afInput', ['types', function(Types){
  return {
    restrict: 'E',
    templateUrl: 'partials/directives/afInput.html',
    scope: {
      type: '=',
      name: '@'
    },
    link: function(scope, element, attrs){
      scope.field = {
        type: scope.type,
        value: null,
      };
      scope.getValue = function(){
        // NEED TO REWRITE FOR MORE FLEXIBLITY
        return new Types[scope.type](scope.field.value);
      };

      // attach to form so form can get the value of the child element
      if(scope.$parent.registerField){
        scope.$parent.registerField(scope);
      }
    }
  };
}])
.directive('afAdm', ['$compile', 'asterix', function($compile, asterix){
  return {
    restrict: 'E',
    scope: { value: '=', headerText: '='},
    link: function(scope, element, attrs){
      scope.$watch('value', function(newValue, oldValue){
        // reset browser
        element.empty();

        // print strings
        if(angular.isString(scope.value) || angular.isNumber(scope.value)){
          element.append('<span>'+ scope.value + '</span>');
        }
        // print booleans
        else if(typeof(scope.value) == 'boolean'){
          element.append('<span class="boolean">' + (scope.value? 'true' : 'false') + '</span>')
        }
        // nulls
        else if(scope.value === null){
          element.append('<span class="null">null</span>')
        }
        else if(angular.isObject(scope.value)){
          if(scope.value.hasOwnProperty('unorderedlist')){
            /*
            For unordered lists
            */

            var header = angular.element('<div class="unorderedlist collapsible">Unordered List (' + scope.value.unorderedlist.length + ') <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            var table = angular.element('<table></table>');
            element.append(header);
            element.append(table);

            angular.forEach(scope.value.unorderedlist, function(value){
              var childScope = scope.$new(true);
              childScope.value = value;
              var compiled = $compile('<tr><td><af-adm value="value"></af-adm></td></tr>')(childScope);
              table.append(compiled);
            });

            header.collapsible({
              speed: 0
            });
          }
          else if(scope.value.hasOwnProperty('orderedlist')){
            var header = angular.element('<div class="collapsible orderedlist">Ordered List (' + scope.value.orderedlist.length + ') <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            var table = angular.element('<table class="content"></table>');
            element.append(header);
            element.append(table);

            angular.forEach(scope.value.orderedlist, function(valEl){
              var childScope = scope.$new(true);
              childScope.value = valEl;
              var compiled = $compile('<tr><td><af-adm value="value"></af-adm></td></tr>')(childScope);
              table.append(compiled);
            });

            header.collapsible({
              speed:0
            });
          }
          else if(asterix.extractNumber(scope.value) !== false){
            element.append('<span>' + asterix.extractNumber(scope.value) + '</span>');
          }
          else{
            var header = angular.element('<div class="record collapsible">Record <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            if(scope.headerText){
              header = angular.element('<div class="record collapsible">' + scope.headerText + ' <span class="open-icon">[+]</span><span class="close-icon">[-]</span></div>');
            }
            var table = angular.element('<table></table>');
            element.append(header);
            element.append(table);

            // populate table w/ individual record elements
            angular.forEach(scope.value, function(fieldValue, fieldKey){
              var childScope = scope.$new(true);
              childScope.key = fieldKey;
              childScope.value = fieldValue;
              $compile('<tr><td class="field-name" ng-bind="key"></td><td><af-adm value="value"></af-adm></td></tr>')(childScope, function(cloned, scope){
                table.append(cloned);
              });
            });

            header.collapsible({
              speed: 0
            });
          }
        }
      });
    }
  };
}]);
