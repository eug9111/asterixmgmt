'use strict'
angular.module('asterface')
.factory('base', ['asterix', function(asterix){
  return {
    db: new AsterixDBConnection({ dataverse: 'Metadata' }),
    currentDataverse: false,
    currentDataset: false,

    dataverses: {},
    datasets: {},
    datatypes: {},
    records: [],

    loadDataverses: function(){
      var base = this;
      return asterix.query('Metadata', 'for $dv in dataset Dataverse return $dv;')
      .then(function(dataverses){
        dataverses.forEach(function(row){
          base.dataverses[row.DataverseName] = row;
        });
      });
    },

    loadDatasets: function(){
      var base = this;
      base.datasets = {};
      return asterix.query('Metadata', sprintf('for $ds in dataset Dataset where $ds.DataverseName="%s" return $ds',
        this.currentDataverse
      )).then(function(datasets){
        datasets.forEach(function(dataset){
          base.datasets[dataset.DatasetName] = dataset;
        });
        base.records = [];
      });


    },

    loadDatatypes: function(){
      var base = this;
      base.datatypes = {};
      return asterix.query('Metadata', sprintf('for $dt in dataset Datatype where $dt.DataverseName="%s" return $dt',
        this.currentDataverse
      )).then(function(datatypes){
        datatypes.forEach(function(datatype){
          base.datatypes[datatype.DatatypeName] = datatype;
        });
      });
    },

    loadRecords: function(ipp, page){
      var base = this;
      // fill up simpleFields.
      var query = sprintf('for $d in dataset %s.%s limit %d offset %d return $d',
        this.currentDataverse,
        this.currentDataset,
        ipp,
        (page-1)*ipp
      );

      return asterix.query('Metadata', query).then(function(records){
        base.records = records;
      });
    }

  };
}])
.controller('BaseController', ['$scope', '$http', '$location', '$modal', 'base',
function($scope, $http, $location, $modal, base){
  $scope.browsing = {
    paging: {
      itemsPerPage: 30,
      page: 1
    },
    showInsertForm: false,
    numCollapsible: 0,
  };

  $scope.insert = {};
  $scope.base = base;

  $scope.$watch('base.currentDataverse', function(){
    if(base.currentDataverse){
      $scope.loadDataverse();
    }
  });

  $scope.$watch('base.currentDataset', function(){
    if(base.currentDataset){
      $scope.loadDataset();
    }
  });

  var loadDatabase = $scope.loadDatabase = function()
  {
    base.loadDataverses();
  };

  loadDatabase();

	$scope.loadDataverse = function()
	{
    if(base.currentDataverse == '#newdataverse')
    {
      var modal = $modal.open({
        templateUrl: '/partials/newDataverse.html',
        controller: 'NewDataverseController',
      });
      modal.result.then(function(){
        base.loadDataverses();

      });
    }
    else
    {
      base.loadDatasets();
      base.loadDatatypes();
    }
	};

	$scope.loadDataset = function() {
    base.loadRecords($scope.browsing.paging.itemsPerPage, $scope.browsing.paging.page);
    $location.path('/browse');
  };

  $scope.createDataset = function(){
    var modal = $modal.open({
      templateUrl: '/partials/datasetform.html',
      controller: 'NewDatasetController',
      size: 'lg',
    });

    modal.result.then(function(newDataset){
      if(newDataset === false)
        return;
      base.loadDatasets();
    }, function(reason){
      console.log(reason);
    });
    //$location.path('/newdataset');
  };

  $scope.createDatatype = function(){
    var modal = $modal.open({
      templateUrl: '/partials/datatypeform.html',
      controller: 'NewDatatypeController',
      size: 'lg'
    });

    modal.result.then(function(newDatatype){
      if(newDatatype === false)
        return;
      base.loadDatatypes();
    }, function(reason){
      console.log(reason);
    });
  };

  $scope.query = function(){
    $location.path('/query');
  }
}]);
