$(function() {
  $('#pcbutton').click(function(){
    var parameters = { postcode: $('#postcode').val() };
      $.get( '/search',parameters, function(data) {
        $('#results').html(data);
      });
  });
  $('#constitlist').change(function(){
    var parameters = { constituency: $('#constitlist').val() };
      $.get( '/search',parameters, function(data) {
        $('#results').html(data);
      });
  });
});
