angular.module('ldxApp', []);
angular.element(function () {
  angular.bootstrap(document, ['ldxApp']);
});

angular.module('ldxApp')
  .component('wrapper', {
    template: '<ng-transclude></ng-transclude>',
    transclude: true,
    controller: ['$http', function ($http) {

      this.refresh = function (id) {
        $http({
          method: 'GET',
          url: '/auth/documents/' + id
        }
        ).then(function (result) {
          this.docList = result.data;
        }.bind(this));
      }.bind(this);

    }]
  })
  .component('fileList', {
    bindings: {
      examId: '<'
    },
    require: {
      parent: '^wrapper'
    },
    templateUrl: '/tpl/file-listing.html',
    controller: ['$http', function ($http) {
      this.$onChanges = function (changes) {
        if (changes && changes.examId && changes.examId.currentValue) {
          this.parent.refresh(changes.examId.currentValue);
        }
      }.bind(this);
    }]
  }).component('fileUploader', {
    require: {
      parent: '^wrapper'
    },
    bindings: {
      details: '<'
    },
    templateUrl: '/tpl/file-upload.html',
    controller: ['$scope', '$http', '$element', '$timeout', function ($scope, $http, $element, $timeout) {

      this.progressBarEl = $element.find('.progress-bar');
      this.progressBarTextEl = $element.find('.progress-bar > span');

      this.showProgressBar = false;
      this.paused = false;
      this.isResume = false;

      this.$onInit = function () {
        var resumable = new Resumable({
          target: '/auth/upload',
          chunkSize: 10 * 1024 * 1024,
          simultaneousUploads: 5,
          testChunks: false,
          maxFiles: 1
        });

        if (!resumable.support) {
          return;
        }

        resumable.assignDrop($element.find('#uploadWell')[0]);
        resumable.assignBrowse(document.getElementById('fileId'));

        resumable.on('fileAdded', function (file) {
          // console.log('fileAdded');
          this.showProgressBar = true;
          $scope.$apply();
          resumable.upload();
        }.bind(this));

        resumable.on('pause', function () {
          // console.log('paused');
        });

        resumable.on('complete', function () {
          // console.log('complete');
          $timeout(function () {
            this.parent.refresh(this.details.examId);
            this.isResume = this.resumable.opts.testChunks = false;
            this.showProgressBar = false;
            this.progressBarEl.css({ width: '0%' });
          }.bind(this), 500)
        }.bind(this));

        resumable.on('fileSuccess', function (file, message) {
          $http({
            method: 'DELETE',
            url: '/auth/upload',
            params: {
              fileName: file.fileName,
              identifier: file.uniqueIdentifier,
              examId: this.details.examId
            }
          });
        }.bind(this));

        resumable.on('fileError', function (file, message) {
          // console.log('fileError');
        });

        resumable.on('fileProgress', function (file) {
          // Handle progress for both the file and the overall upload
          // $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-progress').html(Math.floor(file.progress() * 100) + '%');
          // $('.progress-bar').css({ width: Math.floor(r.progress() * 100) + '%' });
          var progressBar = Math.floor(file.progress() * 100) + '%';
          this.progressBarEl.css({ width: progressBar });
          this.progressBarEl.html(progressBar);
        }.bind(this));

        resumable.on('cancel', function () {
          // console.log('cancel');
          this.progressBarEl.css({ width: '0%' });
          $timeout(function () {
            this.showProgressBar = false;
          }.bind(this), 500)
        }.bind(this));

        resumable.on('uploadStart', function () {
          // console.log('uploadStart');
        });

        this.resumable = resumable;
      }.bind(this);

      this.pause = function () {
        this.paused = true;
        this.resumable.pause();
      }.bind(this);

      this.cancel = function () {
        this.resumable.cancel();
      }.bind(this);

      this.resume = function () {
        this.paused = false;
        this.resumable.upload();
      }.bind(this);

      this.checked = function () {
        this.resumable.opts.testChunks = this.isResume;
      }.bind(this);

    }]
  })
  .controller('FidcController', ['$http', function ($http) {
    this.showList = true;
    this.model = {
      examType: 'Compliance',
      fdicTeam: []
    };

    this.$onInit = function () {
      this.loadData();
    }.bind(this);

    this.loadData = function () {
      $http.get('/data/exams').then(function (res) {
        this.instutionData = res.data;
        this.showList = true;
      }.bind(this));
    }.bind(this);

    this.createExam = function () {
      if (this.examForm.$valid) {
        $http.post('/data/exam', this.model).then(function (a) {
          this.loadData();
        }.bind(this));
      }
    }.bind(this);

  }])
  .controller('BankController', ['$http', '$location', function ($http, $location) {
    this.showDetails = true;
    this.selectedDetails = {};
    this.certNumber;

    this.$onInit = function () {
      this.certNumber = $location.search().id
      if (this.certNumber) {
        this.loadData();  
      }
    }.bind(this);

    this.loadData = function () {
      $http.get('/data/bank/' + this.certNumber).then(function (res) {
        this.instutionData = res.data;
        this.selectedDetails = this.instutionData[0];
      }.bind(this));
    }.bind(this);

    this.manage = function (row) {
      this.showDetails = true;
      this.selectedDetails = row;
    }

  }]);

