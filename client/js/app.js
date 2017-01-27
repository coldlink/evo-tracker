var app = angular.module('evoApp', [])

app.controller('MainController', MainController)

function MainController ($window, $scope) {
  var $ctrl = this
  var socket = $window.io()

  $ctrl.getImage = getImage

  socket.on('data', function (data) {
    $ctrl.data = data
    $ctrl.lastUpdate = new Date().getTime()
    $scope.$apply()
  })

  function getImage (image) {
    return {
      'background-image': 'linear-gradient(rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0.1)), url(' + image + ')'
    }
  }
}
