/*global angular*/
/*jslint node: true */
 
(function () {

jQuery(function($){
    
var container = $("#masonry-container"); 
container.masonry({
    isAnimated : true,
    itemSelector : ".item-masonry",
    columnWidth:60
});
    
    
    
});
    
    'use strict';
    var app =  angular.module('YoutubePlaylist', ['ngSanitize']);
    
   
    app.factory('Playlist', function ($http, $q, $timeout, $sce) {
        var factory = {
            playlists : [],
            nextPage : null,
            
            trustHtml : function(input){
                
                console.warn( $sce.trustAsHtml(input).a);
                return $sce.trustAsHtml(input);
            },
            
            list : function(id) {
                var defered = $q.defer();
                factory.playlists = [];
                factory.nextPage = null;
       
                (function getOne(){
                   
                    factory.getPage(id, factory.nextPage)
                    .then(function (data){
                        if (data.items.length)
                        {
                            angular.forEach(data.items, function(playlist, key){
                                if(factory.playlists !== undefined){
                                    
                                    console.log(factory.trustHtml(playlist.player.embedHtml));
                                    
                                    var datas = {
                                        id : playlist.id,
                                        title: playlist.snippet.title,
                                        thumbail: playlist.snippet.thumbnails.standard,
                                        player: factory.trustHtml(playlist.player.embedHtml)
 
                                    };
                                    
                                    if(datas.thumbail===undefined)
                                    {
                                        datas.thumbail= {
                                            url : "http://www.memedonkey.com/download/39200-grumpy-cat-no-wallpaper-320x240.jpg",
                                            height : 640,
                                            width : 480
                                        };
                                    }
                                    factory.playlists.push(datas);
                                }
                            });
                        }
 
                        if(data.nextPageToken === undefined) {
                            defered.resolve(factory.playlists);
                            return;
                        }
 
                        factory.nextPage = data.nextPageToken;
                        setTimeout(getOne, 0);
 
                    })
                    .catch(function () {
                        defered.reject("no playlist found");
                        return;
                    });
                   
                })();
 
                return defered.promise;
               
            },
           
            getPage : function(id, pageToken){
                var defered = $q.defer();
               
                var params = {
                        channelId : id,
                        part : 'snippet, player',
                        key : 'AIzaSyArOmC2snXbgSAOGrUUhG343-3ei6sQjCA'
                    };
               
                if(pageToken !== false) params.pageToken = pageToken;
               
                $http({
                    method : 'GET',
                    url: 'https://www.googleapis.com/youtube/v3/playlists',
                    params : params
                })
                .success(function(data, status){
                    defered.resolve(data);
                    return;
                })
                .error(function(data, status){
                    defered.reject("not found");
                    return;
                });
 
                return defered.promise;
            },
 
            findId : function (username) {
                var defered = $q.defer();
 
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
                    if (data["items"].length) {
                        defered.resolve(data["items"][0]["id"]);
                        return;
                    }
 
                    defered.reject("channel not found");
                    return;
                })
                .error(function(data, status){
                    defered.reject("not found");
                    return;
                });
 
                return defered.promise;
            }
        };
 
        return factory;
    })
 
    app.controller('ChannelCtrl', [ '$scope', '$http', '$sce', 'Playlist', function ($scope, $http, $sce ,Playlist) {
        $scope.channelId = "not yet";
        $scope.channelName = "";
        $scope.debug = "...";
        $scope.playlists = false;
       
        $scope.findPlaylist = function(){
            Playlist.findId($scope.channelName)
            .then(function(channelId){
                $scope.channelId = channelId;
 
                Playlist.list(channelId)
                .then(function (playlists) {
                    $scope.playlists = playlists;
                    $scope.debug = $scope.playlists;
                })
                .catch(function (err) {
                    $scope.debug = err;
                });
            })
            .catch(function(err){
                $scope.debug = err;
            });
        }
    }]);
})();