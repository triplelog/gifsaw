

var ws = new WebSocket('wss://matherrors.com:8080');
ws.onopen = function(evt) {
	var jsonmessage = {'type':'key'};
	jsonmessage.message = tkey;
	ws.send(JSON.stringify(jsonmessage));
}
ws.onmessage = function(evt){
	var dm = JSON.parse(evt.data);
	if (dm.type == "foundMatch") {
		if (dm.message && dm.message.length>2 && document.getElementById(dm.message[0])){
			var tomatch =dm.message[1];
			for (var i=tomatch.length-1;i>=0;i--){
				if (document.getElementById(tomatch[i])){
				}
				else {
					tomatch = tomatch.splice(i,1);
				}
			}
			socketmerge(dm.message[0],tomatch,dm.message[2]);
		}
		
	}
	
}


/*
socket.on('merge_pieces', (data) => {
	mergepieces(data.piece1,data.piece2,data.locid,data.username);
});

socket.on('new_user', (data) => {
	if (getUrlVars()['solved'] && getUrlVars()['solved']=='partial') {
		var piecesFound = 0;
		for (var i=0;i<data.merges.length;i++) {
			mergepieces(data.merges[i].piece1,data.merges[i].piece2,data.merges[i].locid,data.merges[i].username,true);
			piecesFound++;
		}
		document.getElementById('progressdiv').setAttribute('value',Math.floor(100*piecesFound/npieces));
		var visibleGif = false;
		var fadedGif = false;
		for (var i=1;i<npieces+1;i++){
			if (document.getElementById('video'+i)){
				var thisvideo = document.getElementById('video'+i);
				if (thisvideo.style.top != '50px' || thisvideo.style.left != '50px' || thisvideo.style.transform != 'rotate(0deg)'){
					if (!fadedGif) {
						thisvideo.style.top = '0px';
						thisvideo.style.left = '0px';
						thisvideo.style.transform = 'rotate(0deg)';
						thisvideo.style.opacity = '.33';
						thisvideo.style.width = '100%';
						document.getElementById('progressdiv').style.top = thisvideo.getBoundingClientRect().height+'px';
						document.getElementById('progressdiv').style.width = thisvideo.getBoundingClientRect().width+'px';
						fadedGif = document.getElementById('path'+i);
					}
					else {
						var p1d = fadedGif.getAttribute('d');
						var p2d = document.getElementById('path'+i).getAttribute('d');
						fadedGif.setAttribute('d', p1d+' '+p2d);
						thisvideo.remove();
					}
					
				}
				else {
					if (!visibleGif) {
						thisvideo.style.top = '0px';
						thisvideo.style.left = '0px';
						thisvideo.style.transform = 'rotate(0deg)';
						thisvideo.style.opacity = '1';
						thisvideo.style.width = '100%';
						document.getElementById('progressdiv').style.top = thisvideo.getBoundingClientRect().height+'px';
						document.getElementById('progressdiv').style.width = thisvideo.getBoundingClientRect().width+'px';
						visibleGif = document.getElementById('path'+i);
					}
					else {
						var p1d = visibleGif.getAttribute('d');
						var p2d = document.getElementById('path'+i).getAttribute('d');
						visibleGif.setAttribute('d', p1d+' '+p2d);
						thisvideo.remove();
					}
				}
			}
		}
	}
	else {
		for (var i=0;i<data.merges.length;i++) {
			setTimeout(mergepieces,100*i,data.merges[i].piece1,data.merges[i].piece2,data.merges[i].locid,data.merges[i].username,true);
		}
		if (keepscore){
			myname = data.username;
			var scorediv = document.getElementById('scorediv');
			var newDiv = document.createElement("div");
			newDiv.id = 'score-'+myname;
			newDiv.innerHTML = myname+': 0';
			scorediv.appendChild(newDiv);
		}
	}
	
	
});

socket.on('game_over', (data) => {
	console.log(data.message);
});


function gameOver(isSocket=false) {
	if (socket) {
		socket.emit('game_over', {});
	}
}

*/