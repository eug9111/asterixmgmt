'use strict'
angular.module('asterface', ['ngSanitize', 'ngRoute', 'ui.bootstrap'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .otherwise({
    redirectTo: '/browse'
  });
}])
.factory('types', function(){
  var NumberPrototype = {
    toString: function(){
      if(this.type == 'float' || this.type == 'double'){
        return sprintf('%s("%f")', this.type, this.val);
      }
      return sprintf('%s("%d")', this.type, this.val);
    }
  };

  // helper function to create appropriate wrapper type
  function createType(value){
    if(types.isBasicType(value.type)){
      return new types[value.type](value.value);
    }

    // otherwise treat as record ! NOT GOOD
    //else if(base.datatypes.indexOf(this.value[row].type) != -1){
    else{
      // is an existing type, just parse as a record
      return new types['record'](value.value);
    }
  };

  var types = {
    int8: function(value){
      this.type = 'int8';
      this.val = parseInt(value);
    },
    int16: function(value){
      this.type = 'int16';
      this.val = parseInt(value);
    },
    int32: function(value){
      this.type = 'int32';
      this.val = parseInt(value);
    },
    int64: function(value){
      this.type = 'int64';
      this.val = parseInt(value);
    },
    float: function(value){
      this.type = 'float';
      this.val = parseFloat(value);
    },
    double: function(value){
      this.type = 'double';
      this.val = parseFloat(value);
    },
    string: function(value){
      this.value = value;
      this.toString = function(){
        return '"' + this.value + '"';
      }
    },
    boolean: function(value){
      this.value = value;
      this.toString = function(){
        return this.value;
      }
    },
    record: function(value){
      this.value = value;
      this.toString = function(){
        var dataFlattened = [];
        for(var row in this.value){
          dataFlattened.push(sprintf('"%s": %s', row, createType(this.value[row]).toString()));
        };
        return '{' + dataFlattened.join(',') + '}';
      };
    },
    unorderedList: function(value){
      this.value = value;
      this.toString = function(){
        var result = '{{ ' + this.value.map(function(value){
          return createType(value).toString();
        }).join(', ') + ' }}';
        return result;
      }
    },
    orderedList: function(value){
      this.value = value;
      this.toString = function(){
        var dataFlattened = [];
        this.value.forEach(function(value){
          dataFlattened.push(createType(value).toString());
        });
        return '[' + dataFlattened.join(',') + ']';
      }
    },
    getTypeName: function(obj){
      var result = false;
      if(angular.isObject(obj)){
        var compoundTypeNames = ['int8', 'int16', 'int32', 'int64', 'float', 'double'];
        compoundTypeNames.forEach(function(typeName){
          if(obj.hasOwnProperty(typeName)){
            result = typeName;
          }
        });
        return result;

      }
      else if(angular.isString(obj)) return 'string';
    },
    isBasicType: function(typeName){
      // HACKY
      var basicTypes = {
        'int8': true,
        'int16': true,
        'int32': true,
        'int64': true,
        'double': true,
        'float': true,
        'boolean': true,
        'string': true,
        'point': true,
        'line': true,
        'rectangle': true,
        'circle': true,
        'polygon': true,
        'record': true,
        'orderedList': true,
        'unorderedList': true,
        'date': true,
        'time': true,
        'datetime': true,
        'interval': true,

      };
      return typeName in basicTypes;
    }
  };
  types.int8.prototype = NumberPrototype;
  types.int16.prototype = NumberPrototype;
  types.int32.prototype = NumberPrototype;
  types.int64.prototype = NumberPrototype;
  types.double.prototype = NumberPrototype;
  types.float.prototype = NumberPrototype;

  return types;
})
.factory('asterix', ['$http', 'types', function($http, Types){
  function request(endpoint, params){
    return $http({
      url: '/api' + endpoint,
      params: params,
    }).catch(function(error){
      console.log('Failed to get response from Asterix backend');
    });
  }

  return {
    encodeADM: function(obj){
      if(angular.isObject(obj)){
        // check if number
        var val = this.extractNumber(obj);
        if(val !== false){
          return new Types[Types.getTypeName(obj)](val).toString();
        }
      }
      else if(angular.isString(obj)){
        return obj;
      }
      else{
        throw "Unknown ADM type. " + JSON.stringify(obj);
      }
    },
    extractNumber: function(obj){
      if(angular.isNumber(obj)) return obj;
      if(!angular.isObject(obj)) return false;
      var value = false;
      ['int8', 'int16', 'int32', 'int64'].forEach(function(intType){
        if(obj.hasOwnProperty(intType)){
          value = obj[intType];
        }
      });
      return value;
    },
    query: function(queryString){
      if(arguments.length == 1){
        var queryString = arguments[0];
      }
      else if(arguments.length == 2){
        var queryString = 'use dataverse ' + arguments[0] + ';\n' + arguments[1];
      }
      else{
        throw "Invalid number of arguments";
      }
      return request('/query', {query: queryString}).then(function(response){
        try
        {
          return response.data.results.map(function(recordString){
            return eval('(' + recordString + ')');
          });
        }
        catch(e)
        {
          console.log("Could not parse Asterix output. ");
          throw e;
        }
      });
    },
    ddl: function(queryString){
      if(arguments.length == 1){
        var queryString = arguments[0];
      }
      else if(arguments.length == 2){
        var queryString = 'use dataverse ' + arguments[0] + ';\n' + arguments[1];
      }
      return request('/ddl', {ddl: queryString});
    },
    insert: function(dataverse, dataset, data){
      var record = new Types['record'](data);
      var dataString = sprintf('insert into dataset %s.%s (%s)', dataverse, dataset, record.toString());
      return request('/update', {statements: dataString}).then(function(response){
        if(response.data['error-code']){
          throw {asterixError: response.data.summary};
        }
      });
    },
    del: function(dataverse, dataset, pk){
      var comparisons = [];
      var comparisonString = '';

      for(var k in pk){
        comparisons.push(
          sprintf('$r.%s = %s', k, this.encodeADM(pk[k]))
        );
      }
      comparisonString = comparisons.join(' and ');

      var query = sprintf('delete $r from dataset %s.%s where %s', dataverse, dataset, comparisonString);
      return request('/update', {statements: query});
    }
  };
}]);
