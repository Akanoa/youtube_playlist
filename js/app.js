/*global angular*/
/*jslint node: true */

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

(function () {
    'use strict';
    var app =  angular.module('YoutubePlaylist', []);
    
    app.factory('Playlist', function ($http, $q, $timeout) {
        var factory = {
            playlists : false,
            nextPage : null,
            list : function(id) {
                factory.playlists = [];
        
                (function getOne(){
                    
                    factory.getPage(id, factory.nextPage)
                    .then(function(nextPageToken){
                        if(nextPageToken !== undefined){
                            factory.nextPage = nextPageToken;
                            setTimeout(getOne, 0);
                        }
                        return;
                    }, function(){
                        return;
                    });
                    
                })();
                factory.nextPage = null;
                return factory.playlists;
                
            },
            
            
            
            getPage : function(id, pageToken){
                var deffered = $q.defer();
                

                
                var params = {
                        channelId : id,
                        part : 'snippet, player',
                        key : 'AIzaSyArOmC2snXbgSAOGrUUhG343-3ei6sQjCA'
                    };
                
                if(pageToken!==false){
                    params = {
                        channelId : id,
                        part : 'snippet, player',
                        key : 'AIzaSyArOmC2snXbgSAOGrUUhG343-3ei6sQjCA',
                        pageToken : pageToken
                    };
                }
                
                $http({
                    method : 'GET',
                    url: 'https://www.googleapis.com/youtube/v3/playlists',
                    params : params
                })
                .success(function(data, status){
                    
                    if (data.items.length > 0)
                    {
                        angular.forEach(data.items, function(playlist, key){
                            
                            if(factory.playlists !== undefined){
                                factory.playlists.push({
                                    id : playlist.id,
                                    title: playlist.snippet.title,
                                    thumbail: playlist.snippet.thumbnails.standard,
                                    player: playlist.player.embedHtml
                                });
                            }
                        });
                        deffered.resolve(data.nextPageToken);

                    }
                    deffered.reject("no playlist found");
                })
                .error(function(data, status){
                    deffered.reject("not found");
                });
                return deffered.promise;
            },
            findId : function (username) {
                
                var deffered = $q.defer();
                $http({
                    method : 'GET',
                    url: 'https://www.googleapis.com/youtube/v3/channels',
                    params : {
                        forUsername : username,
                        part : 'id',
                        key : 'AIzaSyArOmC2snXbgSAOGrUUhG343-3ei6sQjCA'
                    }
                })
                .success(function(data, status){
                    if (data["items"].length > 0)
                        deffered.resolve(data["items"][0]["id"]);
                    deffered.reject("channel not found");
                })
                .error(function(data, status){
                    deffered.reject("not found");
                });
                return deffered.promise;
            }
        };
        return factory;
    })

    app.controller('ChannelCtrl', [ '$scope', '$http', 'Playlist', function ($scope, $http,  Playlist) {
        $scope.channelId = "not yet";
        $scope.channelName = "";
        $scope.debug = "...";
        $scope.playlists = false;
        
        $scope.findPlaylist = function(){
            
            Playlist.findId($scope.channelName).then(function(channelId){
                $scope.channelId = channelId;
                $scope.playlists = Playlist.list(channelId);
                $scope.debug = $scope.playlists;
            }, function(err){
                $scope.debug = err;
            });
        }
    }]);
})();