

var ws = new WebSocket('wss://gifsaw.com:8080');
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
			var drid = dm.message[0];
			var pieceInfo = pieces[parseInt(drid.substring(5))-1];
			pieceInfo.rotation = 0;
			document.getElementById(drid).style.transform = 'rotate(0deg)';
			var pairs = tomatch.slice();
			for (var pairi=0;pairi<pairs.length;pairi++){
				drid = pairs[pairi][0];
				pieceInfo = pieces[parseInt(drid.substring(5))-1];
				pieceInfo.rotation = 0;
				document.getElementById(drid).style.transform = 'rotate(0deg)';
			}
			if (dm.message[3]){
				socketmerge(dm.message[0],tomatch,dm.message[2],dm.message[3]);
			}
			else {
				socketmerge(dm.message[0],tomatch,dm.message[2],false);
			}
			
		}
		
	}
	
}


