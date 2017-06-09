// constructs the suggestion engine
// const endpoint = "http://localhost:3001";
const endpoint = "http://dict.tienganhthaytien.com";

let wordlist = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  // `states` is an array of state names defined in "The Basics"
  prefetch: "/no-empty-data.json",
  remote: {
    url: `${endpoint}/q?search=%QUERY`,
    wildcard: "%QUERY",
    transform: function(response) {
      return [response];
    }
  }
});

// let substringMatcher = function(strs) {
//   return function findMatches(q, cb) {
//     var matches, substringRegex;

//     // an array that will be populated with substring matches
//     matches = [];

//     // regex used to determine if a string contains the substring `q`
//     substrRegex = new RegExp(q, 'i');

//     // iterate through the pool of strings and for any string that
//     // contains the substring `q`, add it to the `matches` array
//     $.each(strs, function(i, str) {
//       if (substrRegex.test(str)) {
//         matches.push(str);
//       }
//     });

//     cb(matches);
//   };
// };

$("#s").typeahead(null, {
  name: "wordlist",
  source: wordlist
});

$(function() {
  $(document).keydown(function(e) {
    if (e.which == 13) {
      $(".tt-menu").hide();
      var value = $("#s").val().toLowerCase();
      $("#oald").empty();
      $("#vndic").empty();
      $("#spinning").append(
        '<i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i><span class="sr-only">Loading...</span>'
      );
      $.ajax({
        url: `${endpoint}/dict`,
        data: { search: value }
      }).done(function(data) {
        $("#spinning").empty();
        if (!data.oaldData) {
          $("#oald").append("CANT FIND ANY WORD!");
        }
        // Get OALD data
        var oaldResult = $(data.oaldData);
        // Make sound working
        var linkSoundUk = oaldResult
          .find(".audio_play_button.pron-uk")
          .attr("data-src-mp3");
        var soundHtmlUk =
          '<audio id="sound1" src="' +
          linkSoundUk +
          '" preload="auto"></audio>';
        oaldResult
          .find(".audio_play_button.pron-uk")
          .attr("onclick", 'document.getElementById("sound1").play()');
        var linkSoundUs = oaldResult
          .find(".audio_play_button.pron-us")
          .attr("data-src-mp3");
        var soundHtmlUs =
          '<audio id="sound2" src="' +
          linkSoundUs +
          '" preload="auto"></audio>';
        var html = oaldResult.append(soundHtmlUk).append(soundHtmlUs);
        oaldResult
          .find(".audio_play_button.pron-us")
          .attr("onclick", 'document.getElementById("sound2").play()');
        $("#oald").append(oaldResult);

        // Get 1tudien data
        var vndicResult = data.evData;
        $("#vndic").append(vndicResult);
      });
    }
  });
});
