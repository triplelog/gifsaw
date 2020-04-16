function socketanswer(piece1,pairs) {
	var tomatch = [];
	var piece1 = 'video'+piece1;
	if (pairs.length>0 && document.getElementById(piece1)){
		for (var i=0;i<pairs.length;i++){
			var piece2 = 'video'+pairs[i][0];
			var realidofotherpiece = pairs[i][2];
			var myrealid = pairs[i][3];
			for (var ii=0;ii<matches[myrealid].length;ii++) {
				if (realidofotherpiece == matches[myrealid][ii][0] && pairs[i][1]==matches[myrealid][ii][1]  && document.getElementById(piece2)) {
					//console.log(piece1,piece2,pairs,matches[piece1][ii]);

					tomatch.push([piece2,myrealid,realidofotherpiece,matches[myrealid][ii][1]]);
					
				}
			}
		}
	}
	if (tomatch.length>0){
		socketmerge(piece1,tomatch,'me');
		
	}

}

function socketmerge(piece1,pairs,scoringUser,cssJson=false) {
	var video1 = document.getElementById(piece1);
	if (video1) {
		var p1 = document.getElementById('path'+piece1.substr(5,));
		var piece1Info = pieces[parseInt(piece1.substr(5,))-1];
		var p1d = p1.getAttribute('d');
		if ((p1d.match(/M/g)||[]).length == 1){
			p1d = 'M'+clines[parseInt(piece1.substr(5,))-1][0] + clines[parseInt(piece1.substr(5,))-1][1] + clines[parseInt(piece1.substr(5,))-1][2] + clines[parseInt(piece1.substr(5,))-1][3];
		}
		var p1l = (p1d.match(/M/g)||[]).length;
		if (p1l == 1){
			piece1Info.centers = [{x:ccenters[parseInt(piece1.substr(5,))-1][0],y:ccenters[parseInt(piece1.substr(5,))-1][1], id:piece1Info.id}];
		}
		var mypoints = pairs.length;

		
		for (var pairi=0;pairi<pairs.length;pairi++){
			merges++;
			var piece2 = pairs[pairi][0];
			
			var lrtb = 'lr';
			if (pairs[pairi][3]=='top'){
				var el2 = document.getElementById(pairs[pairi][3]+pairs[pairi][2].substr(5,));
				var el1 = document.getElementById('bottom'+pairs[pairi][1].substr(5,));
				lrtb = 'tb';
			}
			else if (pairs[pairi][3]=='bottom'){
				var el2 = document.getElementById(pairs[pairi][3]+pairs[pairi][2].substr(5,));
				var el1 = document.getElementById('top'+pairs[pairi][1].substr(5,));
				lrtb = 'tb';
			}
			else if (pairs[pairi][3]=='left'){
				var el2 = document.getElementById(pairs[pairi][3]+pairs[pairi][2].substr(5,));
				var el1 = document.getElementById('right'+pairs[pairi][1].substr(5,));
				lrtb = 'lr';
			}
			else if (pairs[pairi][3]=='right'){
				var el2 = document.getElementById(pairs[pairi][3]+pairs[pairi][2].substr(5,));
				var el1 = document.getElementById('left'+pairs[pairi][1].substr(5,));
				lrtb = 'lr';
			}
			if (el2){
				el2.style.display = 'none';
			}
			if (el1){
				el1.classList.add('interiorBorder');
				el1.classList.add(lrtb);
				el1.classList.remove('left');
				el1.classList.remove('right');
				el1.classList.remove('top');
				el1.classList.remove('bottom');
				el1.classList.remove('pieceBorder');
				if (cssJson){
					for (i in cssJson){
						el1.style[i]=cssJson[i];
					}
				}
				
			}
			
			
			var piece2Info = pieces[parseInt(piece2.substr(5,))-1];
			var video2 = document.getElementById(piece2);
			if (video2) {
				
				var p2 = document.getElementById('path'+piece2.substr(5,));
				var p2d = p2.getAttribute('d');
				if ((p2d.match(/M/g)||[]).length == 1){
					p2d = 'M'+clines[parseInt(piece2.substr(5,))-1][0] + clines[parseInt(piece2.substr(5,))-1][1] + clines[parseInt(piece2.substr(5,))-1][2] + clines[parseInt(piece2.substr(5,))-1][3];
				}
				else {
					
				}

				var p2l = (p2d.match(/M/g)||[]).length;
				p1d += ' '+p2d;
				p1l = (p1d.match(/M/g)||[]).length;

				var p2svg = video2.querySelectorAll('svg');
				for (var i=0;i<p2svg.length;i++){
					
					video1.appendChild(p2svg[i]);
				}
				
				
				if (3==2 && p1l > p2l || (piece1Info.rotation == 0 && piece2Info.rotation != 0)) {
					piece2Info.rotation=piece1Info.rotation;
					video2.style.transform = 'rotate('+parseInt(piece1Info.rotation)+'deg)';
					video2.style.transformOrigin = ccenters[parseInt(piece1.substr(5,))-1][0]*100+'% '+ccenters[parseInt(piece1.substr(5,))-1][1]*100+'%';
					video2.style.left = video1.style.left;
					video2.style.top = video1.style.top;
				}
				else {
					piece1Info.rotation=piece2Info.rotation;
					video1.style.transform = 'rotate('+parseInt(piece2Info.rotation)+'deg)';
					video1.style.left = video2.style.left;
					video1.style.top = video2.style.top;
					
					if (p2l == 1){
						video1.style.left = (parseFloat(video2.style.left) - ccenters[parseInt(piece2.substr(5,))-1][0]*cwidth + piece2Info.centers[0].x*cwidth)+'px';
						video1.style.top = (parseFloat(video2.style.top) - ccenters[parseInt(piece2.substr(5,))-1][1]*cheight + piece2Info.centers[0].y*cheight)+'px';
						piece2Info.centers = [{x:ccenters[parseInt(piece2.substr(5,))-1][0],y:ccenters[parseInt(piece2.substr(5,))-1][1],id:piece2Info.id}];
						video1.style.transformOrigin = ccenters[parseInt(piece2.substr(5,))-1][0]*100+'% '+ccenters[parseInt(piece2.substr(5,))-1][1]*100+'%';
					}
					else {
						video1.style.transformOrigin = ccenters[parseInt(piece1.substr(5,))-1][0]*100+'% '+ccenters[parseInt(piece1.substr(5,))-1][1]*100+'%';
					}
					for (var i=0;i<piece2Info.centers.length;i++) {
					
						var tempc = {};
						tempc.id = piece2Info.centers[i].id;
						tempc.x = piece2Info.centers[i].x;
						tempc.y = piece2Info.centers[i].y;
						
						piece1Info.centers.push(tempc);
					}
					
					
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
		document.getElementById('progressdiv').value = merges*100/(ncols*(nrows-1)+nrows*(ncols-1));
		
	}
}

//This function never gets called? - not from encryptedpuzzle or this page
/*
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
*/