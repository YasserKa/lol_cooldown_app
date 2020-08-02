$(document).ready(function() {
      $('.discord').mouseenter(function(){
        $(this).attr('src', '../../img/discord.png');
      }).mouseleave(function() {
        $(this).attr('src', '../../img/discord-white.png');
      });
});