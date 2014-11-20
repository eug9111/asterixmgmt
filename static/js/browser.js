'use strict'
// Browser.js
angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/browse', {
    templateUrl: '/static/partials/browser.html',
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

  $scope.loadInsertForm = function(){
    var modal = $modal.open({
      templateUrl:'/static/partials/insertRowForm.html',
      controller: 'InsertRowController',
      size: 'lg'
    });

    modal.result.then(function(){
      $scope.browsing.paging.page = 1;
      base.loadRecords($scope.browsing.paging.itemsPerPage, $scope.browsing.paging.page);
    }, function(reason){
      if(typeof reason == 'object' && reason.hasOwnProperty('asterixError')){
        alert(reason.asterixError);
      }
    });
  };

  $scope.deleteRecord = function(rid)
  {
    var pk = base.datasets[base.currentDataset].InternalDetails.PrimaryKey.orderedlist;
    var record = base.records[rid];
    var comps = [];

    for(var k in pk)
    {
      var key = pk[k];
      var val = false;

      // support integers
      //!TODO convert numbers into the respective int8,int16,int32, etc...
      // also support other types.
      if(asterix.extractNumber(record[key]) !== false) val = asterix.extractNumber(record[key]);
      else if(typeof record[key] == "string") val = '"' + record[key] + '"';
      else alert("Unknown value (" + key + "): " + record[key]);

      if(val === false){ return; }

      comps.push(new AExpression("$r." + key + "=" + val));
    }

    var where = new WhereClause();
    where.and(comps);

    var delStmt = new DeleteStatement("$r", base.currentDataverse + '.' + base.currentDataset, where);
    console.log(delStmt.val());
    asterix.del(delStmt.val()).then(function(){
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
    fields: type.Derived.Record.Fields.orderedlist
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


  $scope.doInsert = function(closeAfter){
    var record = {};

    $(".insert-field, .insert-field-extra").each(function(box){
      var field = $(this);
      var fieldType = field.attr("fieldtype");

      switch(fieldType)
      {
      case "int8": case "int16": case "int32": case "int64": case "float": case "double": case "string":
        record[ field.attr("name") ] = new types[fieldType](field.val());
        break;
      default:
        record[ field.attr("name") ] = new AExpression(field.val());
        return;
      }

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
}]);
