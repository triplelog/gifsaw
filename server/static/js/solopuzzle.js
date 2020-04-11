function socketanswer(piece1,pairs) {
	var tomatch = [];
	var piece1 = 'video'+piece1;
	if (pairs.length>0 && document.getElementById(piece1)){
		for (var i=0;i<pairs.length;i++){
			var piece2 = 'video'+pairs[i][0];
			for (var ii=0;ii<matches[piece1].length;ii++) {
				if (piece2 == matches[piece1][ii][0] && pairs[i][1]==matches[piece1][ii][1] && document.getElementById(piece2)) {
					tomatch.push(piece2);
				}
			}
		}
	}
	if (tomatch.length>0){
		socketmerge(piece1,tomatch,'me');
		
	}

}

function socketmerge(piece1,pairs,scoringUser,isfirst=false) {
	var video1 = document.getElementById(piece1);
	if (video1) {
		var p1 = document.getElementById('path'+piece1.substr(5,));
		var p1d = p1.getAttribute('d');
		if ((p1d.match(/M/g)||[]).length == 1){
			p1d = 'M'+vclines[parseInt(piece1.substr(5,))-1][0] + hclines[parseInt(piece1.substr(5,))-1][0] + vclines[parseInt(piece1.substr(5,))-1][1] + hclines[parseInt(piece1.substr(5,))-1][1];
		}
		var p1l = (p1d.match(/M/g)||[]).length;
		if (p1l == 1){
			centers[parseInt(piece1.substr(5,))-1] = [[ccenters[parseInt(piece1.substr(5,))-1][0],ccenters[parseInt(piece1.substr(5,))-1][1]]];
		}
		var mypoints = pairs.length;
		if (keepscore) {
			if (keeppoints) {
				mypoints = 0;
			}
		}
		
		
		for (var pairi=0;pairi<pairs.length;pairi++){
			var piece2 = pairs[pairi];
			var video2 = document.getElementById(piece2);
			if (video2) {
				var p2 = document.getElementById('path'+piece2.substr(5,));
				var p2d = p2.getAttribute('d');
				if ((p2d.match(/M/g)||[]).length == 1){
					p2d = 'M'+vclines[parseInt(piece2.substr(5,))-1][0] + hclines[parseInt(piece2.substr(5,))-1][0] + vclines[parseInt(piece2.substr(5,))-1][1] + hclines[parseInt(piece2.substr(5,))-1][1];
				}
				else {
					
				}

				var p2l = (p2d.match(/M/g)||[]).length;
				p1d += ' '+p2d;
				p1l = (p1d.match(/M/g)||[]).length;
				
				if (keepscore) {
					if (keeppoints) {
						mypoints += Math.min(p1l,p2l);
					}
				}
				if (!isfirst) {
					if (3==2 && p1l > p2l || (rotations[parseInt(piece1.substr(5,))-1] == 0 && rotations[parseInt(piece2.substr(5,))-1] != 0)) {
						rotations[parseInt(piece2.substr(5,))-1]=rotations[parseInt(piece1.substr(5,))-1];
						video2.style.transform = 'rotate('+parseInt(rotations[parseInt(piece1.substr(5,))-1])+'deg)';
						video2.style.left = video1.style.left;
						video2.style.top = video1.style.top;
					}
					else {
						rotations[parseInt(piece1.substr(5,))-1]=rotations[parseInt(piece2.substr(5,))-1];
						video1.style.transform = 'rotate('+parseInt(rotations[parseInt(piece2.substr(5,))-1])+'deg)';
						video1.style.left = video2.style.left;
						video1.style.top = video2.style.top;
						
						if (p2l == 1){
							video1.style.left = (parseFloat(video2.style.left) - ccenters[parseInt(piece2.substr(5,))-1][0]*cwidth + centers[parseInt(piece2.substr(5,))-1][0][0]*cwidth)+'px';
							video1.style.top = (parseFloat(video2.style.top) - ccenters[parseInt(piece2.substr(5,))-1][1]*cheight + centers[parseInt(piece2.substr(5,))-1][0][1]*cheight)+'px';
							centers[parseInt(piece2.substr(5,))-1] = [[ccenters[parseInt(piece2.substr(5,))-1][0],ccenters[parseInt(piece2.substr(5,))-1][1]]];
						}
						for (var i=0;i<centers[parseInt(piece2.substr(5,))-1].length;i++) {
							centers[parseInt(piece1.substr(5,))-1].push(centers[parseInt(piece2.substr(5,))-1][i]);
						}
						for (var i=0;i<matches[piece2].length;i++){
							matches[piece1].push(matches[piece2][i]);
							
							if (matches[piece2][i][1]=='bottom') {matches[matches[piece2][i][0]].push([piece1,'top']);}
							else if (matches[piece2][i][1]=='top') {matches[matches[piece2][i][0]].push([piece1,'bottom']);}
							else if (matches[piece2][i][1]=='left') {matches[matches[piece2][i][0]].push([piece1,'right']);}
							else if (matches[piece2][i][1]=='right') {matches[matches[piece2][i][0]].push([piece1,'left']);}
						}
					}
				}
				else { //Do this too!
					rotations[parseInt(piece1.substr(5,))-1]=0;
					rotations[parseInt(piece2.substr(5,))-1]=0;
					video1.style.transform = 'rotate(0deg)';
					video1.style.left = '50px';
					video1.style.top = '50px';
					video2.style.transform = 'rotate(0deg)';
					video2.style.left = '50px';
					video2.style.top = '50px';
				}

				
				document.getElementById(piece2).remove();
				p2.remove();
				saveButton.setAttribute('href',window.location.pathname.replace('/puzzles/','/save/')+'?merges=');
				//Combine match arrays and remove extra one.
				
			}
		}
		p1.setAttribute('d', p1d);
		if (keepscore) {
			if (score[scoringUser]){
				score[scoringUser] += mypoints;
				document.getElementById('score-'+scoringUser).innerHTML = scoringUser+': '+score[scoringUser];
			}
			else {
				score[scoringUser] = mypoints;
				var scorediv = document.getElementById('scorediv');
				var newDiv = document.createElement("div");
				newDiv.id = 'score-'+scoringUser;
				newDiv.innerHTML = scoringUser+': '+score[scoringUser];
				scorediv.appendChild(newDiv);
			}
		}
		
	}
}


function mergepieces(piece1,piece2,locid,issocket=false,isfirst=false) {
	if (document.getElementById(piece2) && document.getElementById(piece1)) {
		var p1 = document.getElementById('path'+piece1.substr(5,));
		var p1d = p1.getAttribute('d');
		var p2 = document.getElementById('path'+piece2.substr(5,));
		var p2d = p2.getAttribute('d');
		var p1l = (p1d.match(/M/g)||[]).length;
		var p2l = (p2d.match(/M/g)||[]).length;
		var mypoints = 1;
		if (keepscore) {
			if (keeppoints) {
				mypoints = Math.min(p1l,p2l);
			}
		}
		p1.setAttribute('d', p1d+' '+p2d);
		if (issocket) {
			
			var video1 = document.getElementById(piece1);
			var video2 = document.getElementById(piece2);
			if (keepscore) {
				if (score[issocket]){
					score[issocket] += mypoints;
					document.getElementById('score-'+issocket).innerHTML = issocket+': '+score[issocket];
				}
				else {
					score[issocket] = mypoints;
					var scorediv = document.getElementById('scorediv');
					var newDiv = document.createElement("div");
					newDiv.id = 'score-'+issocket;
					newDiv.innerHTML = issocket+': '+score[issocket];
					scorediv.appendChild(newDiv);
				}
			}
			if (!isfirst) {
				
				if (p1l > p2l || (rotations[parseInt(piece1.substr(5,))-1] == 0 && rotations[parseInt(piece2.substr(5,))-1] != 0)) {
					rotations[parseInt(piece2.substr(5,))-1]=rotations[parseInt(piece1.substr(5,))-1];
					video2.style.transform = 'rotate('+parseInt(rotations[parseInt(piece1.substr(5,))-1])+'deg)';
					video2.style.left = video1.style.left;
					video2.style.top = video1.style.top;
				}
				else {
					rotations[parseInt(piece1.substr(5,))-1]=rotations[parseInt(piece2.substr(5,))-1];
					video1.style.transform = 'rotate('+parseInt(rotations[parseInt(piece2.substr(5,))-1])+'deg)';
					video1.style.left = video2.style.left;
					video1.style.top = video2.style.top;
				}
			}
			else {
				rotations[parseInt(piece1.substr(5,))-1]=0;
				rotations[parseInt(piece2.substr(5,))-1]=0;
				video1.style.transform = 'rotate(0deg)';
				video1.style.left = '50px';
				video1.style.top = '50px';
				video2.style.transform = 'rotate(0deg)';
				video2.style.left = '50px';
				video2.style.top = '50px';
			}
		}
		else {
			if (keepscore) {
				if (score[myname]){
					score[myname] += mypoints;
					document.getElementById('score-'+myname).innerHTML = myname+': '+score[myname];
				}
				else {
					score[myname] = mypoints;
					document.getElementById('score-'+myname).innerHTML = myname+': '+score[myname];
				}
			}
			if (socket){
				socket.emit('merge_pieces',{'piece1':piece1,'piece2':piece2,'locid':locid});
			}
		}
		document.getElementById(piece2).remove();
		p2.remove();
		saveButton.setAttribute('href',window.location.pathname.replace('/puzzles/','/save/')+'?merges=');
		//Combine match arrays and remove extra one.
		var matches2 = matches[piece2];
		var nmatches2 = matches2.length;
		for (var ii=0;ii<nmatches2;ii++ ) {
			if (matches2[ii]==piece1) {
				continue;
			}
			var isRepeat = false;
			for (var iii=0;iii<nmatches;iii++ ) {
				if (matches[piece1][iii]==matches2[ii]){
					isRepeat = true;
					break;
				}
			}
			if (!isRepeat) {
				matches[piece1].push(matches2[ii]);
			}
			var arr = matches[matches2[ii]];
			var isThere = false;
			for( var i = 0; i < arr.length; i++){ 
			   if ( arr[i] === piece2) {
				 matches[matches2[ii]].splice(i,1);
			   }
			   if ( arr[i] === piece1) {
				 isThere = true;
			   }
			}
			if (!isThere) {
				matches[matches2[ii]].push(piece1);
			}
		}
		delete matches2;
		matches[piece1].splice(locid,1);
		if (!issocket) {
			if (Object.keys(matches[piece1]).length == 0) {
				gameOver();
			}
		}

		vmatches = {};
		nmatches = matches[piece1].length;
		for (var ii=0;ii<nmatches;ii++) {
			let tempkey = matches[piece1][ii];
			let tempvideo = document.getElementById(tempkey).getBoundingClientRect();
			vmatches[tempkey]=[tempvideo.left,tempvideo.top];
		}
	}

}