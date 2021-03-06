function initial_setup() {
	console.log("initialize");
	socket = io.connect('http://192.168.3.101:3000');
	socket.on('response', onResponse);
	
}
function handle_button_input(){
  $(".play-button").click(function(){
      var action_name = $(this).attr('value');
      // send current action taken by user to server
      data1 = {
        'id': _id,
        'action': action_name,
      };
      console.log(data1);
      socket.emit('sendResponse', data1);
   });
}

var _id,_username, _index, _base;
var d = document;
var transition_delay = 500;
$(document).ready(function(){
  // initial_setup();
  $('#winner-button').hide();
	handle_button_input();
});

function onResponse(data){
	console.log(data);
	if(data._id)
		{ _id=data._id; _username=data._name; _index = data._index; console.log(_id); }
	else 
		{
			$('#total-bet').html(data.total_bet);
			$('#current-bet-amt').html(data.current_bet_amt);
			$('#user1-amt-avail').html(data.user1.amt_avail);
			$('#user2-amt-avail').html(data.user2.amt_avail);

      if(data.total_bet == 40){
        // display card
        console.log("showing card");
        if(_index == 0){
          html_content = "";
          for(var card of data.user1.list_of_cards){
            html_content += "<img class='card' src='cards/"+card+".svg'> ";
          }
          $("#user-1-card").html(html_content);

          html_content = "";
          for(var i=0; i<3; i++){
            html_content += "<img class='card' src='cards/RED_BACK.svg'>";
          }
          $("#user-2-card").html(html_content);
        }
        else{
          html_content = "";
          for(var card of data.user2.list_of_cards){
            html_content += "<img class='card' src='cards/"+card+".svg'> ";
          }
          $("#user-2-card").html(html_content);

          html_content = "";
          for(var i=0; i<3; i++){
            html_content += "<img class='card' src='cards/RED_BACK.svg'>";
          }
          $("#user-1-card").html(html_content);
        }
      }

      // in case if a player wins
      if(data.winner != -1){
        console.log("winner hua koi");
        $('#action-buttons').hide(transition_delay);
        $('#wait-for-opponent').hide(transition_delay);
        msg_str = "User " + (data.winner+1) + " Won";
        speak(msg_str);
        $('#winner-button').html(msg_str);
        $('#winner-button').show(transition_delay);
        // show all cards
        html_content = "";
        for(var card of data.user1.list_of_cards){
          html_content += "<img class='card' src='cards/"+card+".svg'> ";
        }
        $("#user-1-card").html(html_content);
        html_content = "";
        for(var card of data.user2.list_of_cards){
          html_content += "<img class='card' src='cards/"+card+".svg'> ";
        }
        $("#user-2-card").html(html_content);
      }
      else{
        // rotate turns of player
  			if(data.turn_of_player == _index){
  				$('#action-buttons').show(transition_delay);
  				$('#wait-for-opponent').hide(transition_delay);
  			}
  			else{
  				$('#action-buttons').hide(transition_delay);
  				$('#wait-for-opponent').show(transition_delay);

  			}
      }
			_base=data['current_bet_amt'];
			_totalbet=data['total_bet'];
		}
	setTimeout(function(){
		//console.log("user id is "+_id);

		},1000);
}

function emitdata(){    
	socket.emit('response', data);
}
//--------------------- speech part ------------------------------//
// var myRec = new p5.SpeechRec('en-US', parseResult); // new P5.SpeechRec object
// myRec.continuous = true; // do continuous recognition
// myRec.interimResults = false; // allow partial recognition (faster, less accurate)

var myVoice = new p5.Speech(); // new P5.Speech object
function setup()
{ 
  myVoice.setRate(0.5);
  //myRec.onResult = parseResult; // now in the constructor
  // myRec.start(); // start engine
  startButton();
}
function speak(text)
{ 
  console.log("in speak");
  setTimeout(function() {
  myVoice.speak(text);
  }, 1000);
}


var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      console.log('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      console.log('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        console.log('info_blocked');
      } else {
        console.log('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      window.getSelection().addRange(range);
    }
  };
  var line = '';
  var f=0;
  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        line = event.results[i][0].transcript;
        console.log(line);
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
  if (''+line.toLowerCase()=="play" && f==0) {
    initial_setup();
    speak("Game is starting , the initial amount is 20 points");
    console.log("Game is starting , the initial amount is 20 points")
    f=1;
  }
  if(["chal","call"].indexOf(line.toLowerCase()))
  {  
    console.log('chal');
    sendAction(_id, 'call');
  }
  else if(["pak","pack"].indexOf(line.toLowerCase()))
  { 
    console.log('pack'); 
    sendAction(_id, 'pack');
  }
  else if(["show"].indexOf(line.toLowerCase()))
  { 
    console.log('show'); 
    sendAction(_id, 'show');
  }
  else if(["raise","rase","ras"].indexOf(line.toLowerCase()))
  { 
    console.log('raise'); 
    sendAction(_id, 'raise');
  }
  else {
    console.log('try again');
  }  
};

function sendAction(_id, action_name){
    data1 = {
      'id': _id,
      'action': action_name,
    }
    socket.emit('sendResponse', data1);
    console.log('data1', data1);
}

function startButton() {
  final_transcript = '';
  recognition.start();
  ignore_onend = false;
}

function stop(){
   if (recognizing) {
    recognition.stop();
    return;
   }
}