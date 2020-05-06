function toggle() {
	var els = document.querySelectorAll('svg path');
	for (var i in els){
		if (els[i].classList){
			els[i].classList.toggle('toggled');
		}
	}
}

for (var i=0;i<npieces;i++) {
	var video = document.getElementById('video'+(i+1));
	
	video.addEventListener('mousedown',dragstart);
	
	video.style.left = (w - cwidth)*pieces[i].location[0]+'px';
	video.style.top = (h - cheight)*pieces[i].location[1]+'px';
	video.style.transform = 'rotate('+pieces[i].rotation+'deg)';
	video.style.transformOrigin = pieces[i].centers[0].x*100+'% '+pieces[i].centers[0].y*100+'%';
	//video.style.display = 'none';
	videos['video'+(i+1)] = video;
	
	
}

function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay || !dragid || dragid.length<5) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}
const tHandler = throttled(40, dragmove);
document.addEventListener('mousemove',tHandler);
document.addEventListener('mouseup',dragend);



function dragstart(event) {
	event.preventDefault();
	e = event || window.event;
	
	if (!dragid || dragid == ''){
		if (e.target.id){
			dragid = e.target.id;
		}
		else {
			dragid = e.target.parentElement.id;
		}
		console.log(dragid);
		cvideo = videos[dragid];
		if (cvideo) {
			vmatches = [];
			nmatches = 0;
			var vidid = parseInt(dragid.substr(5,))-1;
			startX = [e.pageX,parseFloat(cvideo.style.left),pieces[vidid].centers[0].x*parseFloat(cwidth)-parseFloat(piecewidth)/2];
			startY = [e.pageY,parseFloat(cvideo.style.top),pieces[vidid].centers[0].y*parseFloat(cheight)-parseFloat(pieceheight)/2];
			for (var ii=0;ii<pieces[vidid].centers.length;ii++){
				if (pieces[vidid].centers[ii].x*parseFloat(cwidth)-parseFloat(piecewidth)/2 < startX[2]){
					startX[2] = pieces[vidid].centers[ii].x*parseFloat(cwidth)-parseFloat(piecewidth)/2;
				}
				if (pieces[vidid].centers[ii].y*parseFloat(cheight) -parseFloat(pieceheight)/2< startY[2]){
					startY[2] = pieces[vidid].centers[ii].y*parseFloat(cheight)-parseFloat(pieceheight)/2;
				}
			}
			for (var i=1;i<npieces+1;i++) {
				let tempkey = 'video'+i;
				var el = document.getElementById(tempkey);
				if (el && tempkey != dragid){
					
					let tempvideo = videos[tempkey].getBoundingClientRect();
					
					for (var ii=0;ii<pieces[i-1].centers.length;ii++){
						var centerx = pieces[i-1].centers[ii].x*parseFloat(cwidth);
						var centery = pieces[i-1].centers[ii].y*parseFloat(cheight);
						if (pieces[i-1].rotation == 90) {
							centerx = (1-pieces[i-1].centers[ii].y)*parseFloat(cheight);
							centery = pieces[i-1].centers[ii].x*parseFloat(cwidth);
						}
						vmatches.push([tempkey,[parseFloat(tempvideo.left)+centerx,parseFloat(tempvideo.top)+centery, pieces[i-1].centers[ii].id]]);

						nmatches++;
					}
				}
			}
		}
	}
	
}

function dragmove(event) {
	e = event || window.event;

	if (dragid && dragid.length > 5) {
		let newLeft = e.pageX;
		let newTop = e.pageY;
		if ((newLeft < startX[0]-0 || newLeft > startX[0]+0) && (newTop < startY[0]-0 || newTop > startY[0]+0)){
			if (newLeft - startX[0] + startX[1] <= -1*startX[2]){
				newLeft = startX[0] - startX[1] - startX[2];
			}
			if (newTop - startY[0] + startY[1] <= -1*startY[2]){
				newTop = startY[0] - startY[1] - startY[2];
			}
			cvideo.style.left = newLeft - startX[0] + startX[1] + 'px';
			cvideo.style.top = newTop - startY[0] + startY[1] + 'px';
			startX[1] += newLeft - startX[0];
			startY[1] += newTop- startY[0];
			startX[0] = newLeft;
			startY[0] = newTop;
			isclick = false;
			
		}
		else if (newLeft < startX[0]-0 || newLeft > startX[0]+0){
			if (newLeft - startX[0] + startX[1] <= -1*startX[2]){
				newLeft = startX[0] - startX[1] - startX[2];
			}
			cvideo.style.left = newLeft - startX[0] + startX[1] + 'px';
			startX[1] += newLeft - startX[0];
			startX[0] = newLeft;
			isclick = false;
		}
		else if (newTop < startY[0]-0 || newTop > startY[0]+0){
			if (newTop - startY[0] + startY[1] <= -1*startY[2]){
				newTop = startY[0] - startY[1] - startY[2];
			}
			cvideo.style.top = newTop - startY[0] + startY[1] + 'px';
			startY[1] += newTop - startY[0];
			startY[0] = newTop;
			isclick = false;
		}
	}
	

}
function dragend() {
	if (isclick && dragid && dragid != '') {
		var drid = dragid;
		var pieceInfo = pieces[parseInt(drid.substr(5,))-1];
		document.getElementById(drid).style.transform = 'rotate('+(parseInt(pieceInfo.rotation)+90)+'deg)';
		pieceInfo.rotation=(parseInt(pieceInfo.rotation)+90);
		if (pieceInfo.rotation> 350) {
			pieceInfo.rotation = pieceInfo.rotation-360;
		}
	}
	else if (dragid && dragid != '') {
		var pieceInfo = pieces[parseInt(dragid.substr(5,))-1];
		
		var possMatches = {};
		possMatches[parseInt(dragid.substr(5,))]=[];
		const start = Date.now();
		
		var oldRot = cvideo.style.transform;
		cvideo.style.transform = 'rotate(0deg)';
		for (var ii=0;ii<pieceInfo.centers.length;ii++) {
			var centerx = pieceInfo.centers[ii].x*parseFloat(cwidth);
			var centery = pieceInfo.centers[ii].y*parseFloat(cheight);
			if (pieceInfo].rotation == 90) {
				centerx = (1-pieceInfo.centers[ii].y)*parseFloat(cheight);
				centery = pieceInfo.centers[ii].x*parseFloat(cwidth);
			}
			
			let newx = parseFloat(cvideo.getBoundingClientRect().left)+centerx;
			let newy = parseFloat(cvideo.getBoundingClientRect().top)+centery;
			let newid = pieceInfo.centers[ii].id;
			for (var i=0;i<nmatches;i++) {
				var possMatch = false;
				let tempkey = parseInt(vmatches[i][0].substr(5,))-1;
				let tempbox = vmatches[i][1];

				if (pieceInfo.rotation==pieces[tempkey].rotation) {
					if (newx < tempbox[0] + piecewidth + 10 && newy < tempbox[1] + pieceheight + 10) {
						if (newx > tempbox[0] + piecewidth - 10) {
							//in far right match zone
						
							if (newy > tempbox[1] - 10 && newy < tempbox[1] + 10) {
								possMatch = 'right';
							}
						
						}
						else if (newx > tempbox[0] - piecewidth - 10 && newx < tempbox[0] - piecewidth + 10) {
							//in far left match zone
						
							if (newy > tempbox[1] - 10 && newy < tempbox[1] + 10) {
								possMatch = 'left';
							}
						}
						else if (newx > tempbox[0] - 10 && newx < tempbox[0] + 10) {
							//in center match zone
							if (newy > tempbox[1] + pieceheight - 10) {
								possMatch = 'bottom';
							}
							else if (newy > tempbox[1] - pieceheight - 10 && newy < tempbox[1] - pieceheight + 10) {
								possMatch = 'top';
							}
						}
				
					}
				}
				if (possMatch) {
					var realid = tempbox[2]; //video1 if actual piece is topleft
					var skipMatch = false;
					/*for (var iii=0;iii<possMatches[parseInt(dragid.substr(5,))].length;iii++) {
						if (possMatches[parseInt(dragid.substr(5,))][iii][2]==realid && possMatches[parseInt(dragid.substr(5,))][iii][1]==possMatch){
							skipMatch = true;
							break;
						}
					}*/
					if (!skipMatch){
						possMatches[parseInt(dragid.substr(5,))].push([tempkey+1,possMatch,realid,newid]);
					}
				}
			}
		}			
		cvideo.style.transform = oldRot;
		if (possMatches[parseInt(dragid.substr(5,))].length>0){
			if (collab){
				var jsonmessage = {type:'possMatch',message:[parseInt(dragid.substr(5,)), possMatches[parseInt(dragid.substr(5,))]]};
				ws.send(JSON.stringify(jsonmessage));
			}
			else {
				socketanswer(parseInt(dragid.substr(5,)),possMatches[parseInt(dragid.substr(5,))]);
			}
			
		}
		const ms = Date.now() - start;
		
	}
	dragid = '';
	isclick = true;
	
}
function playvideo() {
	for (var i=1;i<npieces+1;i++) {
		var video = videos['video'+i];
		if (video){video.style.display = 'inline-block';}
	}
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

