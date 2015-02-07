angular.module('asterface')
.directive('afInput', ['types', function(Types){
  return {
    restrict: 'E',
    templateUrl: 'partials/directives/afInput.html',
    scope: {
      type: '=',
      name: '@'
    },
    controller: 'AfInputController',
    controllerAs: 'AfInputController',
    link: function(scope, element, attrs){
      scope.field = {
        type: scope.type,
        value: null,
      };


      // attach to form so form can get the value of the child element
      if(scope.$parent.registerField){
        scope.$parent.registerField(scope);
      }

    }
  };
}])
.controller('AfInputController', ['$scope', 'base', function($scope, Base){
  $scope.getValue = function(){
    // NEED TO REWRITE FOR MORE FLEXIBLITY
    return new Types[scope.type](scope.field.value);
  };

  $scope.doesTypeExist = function(type){
    return Base.datatypes.hasOwnProperty(type);
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
}])
.directive('afInputPoint', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/point.html',
    link: function(scope, element, attrs){
      scope.model = { x: null, y: null };
    }
  };
}])
.directive('afInputRectangle', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/rectangle.html',
    link: function(scope, element, attrs){
      scope.model = {
        a: { x: null, y: null },
        b: { x: null, y: null }
      }
    }
  };
}])
.directive('afInputCircle', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/circle.html',
    link: function(scope, element, attrs){
      scope.model = {
        radius: null,
        center: {
          x: null,
          y: null
        }
      }
    }
  };
}])
.directive('afInputPolygon', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/polygon.html',
    link: function(scope, element, attrs){
      scope.model = [];
      scope.addField = function(){
        scope.model.push({ x: null, y: null });
      };

      scope.removeField = function(index){
        scope.model.splice(index);
      };
    },
  }
}])
.directive('afInputDatetime', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/datetime.html',
    link: function(scope, element, attrs){
      scope.model = { date: null, time: null };
    }
  }
}])
.directive('afInputLine', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/line.html',
    link: function(scope, element, attrs){
      scope.model = {
        a: { x: null, y: null },
        b: { x: null, y: null },
      };
    }
  };
}])
.directive('afInputRecord', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/record.html',
    link: function(scope, element, attrs){
      scope.model = Object.create(null);
      scope.addField = function(){
        scope.model[scope.fieldKey] = null;
      };

      scope.removeField = function(key){
        delete scope.model[key];
      };
    }
  };
}])
.directive('afInputOrderedList', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/orderedList.html',
    link: function(scope, element, attrs){
      scope.model = [];
    }
  };
}])
.directive('afInputUnorderedList', ['types', function(Types){
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    templateUrl: 'partials/directives/inputs/unorderedList.html',
    link: function(scope, element, attrs){
      scope.model = [];
    }
  };
}])
.directive('afInputType', ['types', 'base', function(types, base){
  return {
    restrict: 'E',
    scope: {
      type: '='
    },
    templateUrl: 'partials/directives/inputs/types.html',
    link: function(scope, element, attrs){
      scope.getTypes = function(){
        return base.datatypes;
      }

      var admType = base.datatypes[scope.type];
      scope.insert = {
        extraFields: [],
        newField: {},
        isOpen: admType.Derived.Record.IsOpen,
        fields: admType.Derived.Record.Fields.orderedlist,
        afFields: []
      };

      scope.alerts = [];

      scope.getExtraFields = function(fields, exclude){
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

      scope.addField = function(){
        scope.insert.extraFields.push({
          FieldName: scope.insert.newField.Name,
          FieldType: scope.insert.newField.Type
        });
      };

      scope.registerField = function(childScope){
        scope.insert.afFields.push(childScope);
      };

      scope.doInsert = function(closeAfter){
        var record = {};
        scope.insert.afFields.forEach(function(scope){
          record[scope.name] = scope.getValue();
        });

        asterix.insert(base.currentDataverse, base.currentDataset, record);
      };

      scope.closeAlert = function(index){
        scope.alerts.splice(index, 1);
      }

      scope.clearForm = function(){
        $('.insert-field, .insert-field-extra').val('');
      }
    }
  }
}])
