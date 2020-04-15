

var ws = new WebSocket('wss://matherrors.com:8080');
ws.onopen = function(evt) {
	var jsonmessage = {'type':'key'};
	jsonmessage.message = tkey;
	ws.send(JSON.stringify(jsonmessage));
}
ws.onmessage = function(evt){
	var dm = JSON.parse(evt.data);
	if (dm.type == "foundMatch") {
		if (dm.message && dm.message.length>3 && document.getElementById(dm.message[0])){
			var tomatch =dm.message[1];
			for (var i=tomatch.length-1;i>=0;i--){
				if (document.getElementById(tomatch[i][0])){
				}
				else {
					tomatch = tomatch.splice(i,1);
				}
			}
			if (dm.message[3].css){
				socketmerge(dm.message[0],tomatch,dm.message[2],dm.message[3].css);
			}
			else {
				socketmerge(dm.message[0],tomatch,dm.message[2],false);
			}
			
		}
		
	}
	
}




socket.on('game_over', (data) => {
	console.log(data.message);
});


function gameOver(isSocket=false) {
	if (socket) {
		socket.emit('game_over', {});
	}
}

*/