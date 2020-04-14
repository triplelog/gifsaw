var ws = new WebSocket('wss://matherrors.com:8080');
ws.onopen = function(evt) {
	var jsonmessage = {'type':'key'};
	jsonmessage.message = 'tkey';
	ws.send(JSON.stringify(jsonmessage));
}
ws.onmessage = function(evt){
	var dm = JSON.parse(evt.data);
	//var el = document.getElementById('imageHolder');
	var img = document.getElementById('imageHolder').querySelector('img');
	img.setAttribute('src',dm.src);
	//el.innerHTML = '';
	//el.appendChild(img);
	document.querySelector('input[name="fileSrc"]').setAttribute('value',dm.src);
	
}

var imageHeight = false;
var imageWidth = false;
var dimensions = [];
function updateNpieces() {
	var npieces = document.getElementById('npieces').value;
	var img = document.getElementById('imageHolder').querySelector('img');
	if (img){
		console.log(img.height);
		console.log(img.width);
		imageHeight = img.height;
		imageWidth = img.width;
	}
	
	
	var height = 1000;
	if(imageHeight){height = imageHeight;}
	var width = imageWidth || 1000;
	if(imageWidth){width = imageWidth;}
	dimensions = [];
	if (npieces <0){
		return;
	}
	
	let nrowsf = Math.floor(Math.sqrt(npieces*height/width));
	let ncolsf = Math.floor(nrowsf*width/height);

	
	//Find closest approximations
	var approxdimensions = [];
	var mind = npieces*2;
	if (nrowsf <3){nrowsf = 3;}
	if (ncolsf <3){ncolsf = 3;}
	for (var i=nrowsf-2;i<nrowsf+4;i++) {
		for (var ii=ncolsf-2;ii<ncolsf+4;ii++) {
			var nnpieces = i*ii;
			var npieceserr = Math.sqrt( (nnpieces-npieces)*(nnpieces-npieces)/(npieces*npieces) );
			var rat = ii/i;
			var raterr = Math.sqrt( (rat-width/height)*(rat-width/height)/((width/height)*(width/height)) );
			//var score = (raterr+.01) * Math.pow( npieceserr+.01, 2);
			var score = raterr + npieceserr*8;
			var dim = {nrows:i,ncols:ii,score:score};
			approxdimensions.push(dim);
		}
	}
	
	//Find nearest factors
	var exactdimensions = [];
	for (var i=1;i<npieces+1;i++) {
		if (npieces % i == 0){
			ii = npieces/i;
			var nnpieces = i*ii;
			var npieceserr = Math.sqrt( (nnpieces-npieces)*(nnpieces-npieces)/(npieces*npieces) );
			var rat = ii/i;
			var raterr = Math.sqrt( (rat-width/height)*(rat-width/height)/((width/height)*(width/height)) );
			//var score = (raterr+.01) * Math.pow( npieceserr+.01, 2);
			var score = raterr + npieceserr*8;
			var dim = {nrows:i,ncols:ii,score:score};
			exactdimensions.push(dim);
			
		}
	}
	exactdimensions.sort(function compare(a, b) {
	  if (a.score > b.score) return 1;
	  if (b.score > a.score) return -1;

	  return 0;
	});
	
	approxdimensions.sort(function compare(a, b) {
	  if (a.score > b.score) return 1;
	  if (b.score > a.score) return -1;

	  return 0;
	});
	dimensions = exactdimensions.slice(0,2);
	for (var iii in approxdimensions){
		var isRepeat = false;
		for (var iiii in dimensions){
			if (dimensions[iiii].nrows==approxdimensions[iii].nrows && dimensions[iiii].ncols==approxdimensions[iii].ncols){
				isRepeat = true;
			}
		}
		if (!isRepeat){
			dimensions.push(approxdimensions[iii]);
		}
		if (dimensions.length == 10){
			break;
		}
	}
	
	
	var el = document.getElementById('size');
	el.innerHTML = '';
	for (var i in dimensions){
		var option = document.createElement('option');
		option.value = dimensions[i].nrows+'x'+dimensions[i].ncols;
		option.textContent = dimensions[i].nrows+' x '+dimensions[i].ncols + ' ('+(dimensions[i].nrows*dimensions[i].ncols)+' pieces)';
		el.appendChild(option);
	}
	var option = document.createElement('option');
	option.value = 'custom';
	option.textContent = 'Custom';
	el.appendChild(option);
	updateSize();
	
}
function updateSize(evt) {
	if (evt && evt.target.id == 'nrows'){
		return;
	}
	else if (evt && evt.target.id == 'ncols'){
		return;
	}
	var el = document.getElementById('size');
	if (el.value == 'custom'){
		return;
	}
	var dim = el.value.split('x');
	var nrows = parseInt(dim[0]);
	var ncols = parseInt(dim[1]);
	document.getElementById('nrows').value = nrows;
	document.getElementById('ncols').value = ncols;
	
	var img = document.getElementById('imageHolder').querySelector('img');
	if (img){
		imageHeight = img.height;
		imageWidth = img.width;
		var retval = makelines(imageWidth,imageHeight,nrows,ncols);
		var svg = document.getElementById('imageHolder').querySelector('svg');
		document.getElementById('imageHolder').style.height= imageHeight+'px';
		document.getElementById('imageHolder').style.width= imageWidth+'px';
		svg.setAttribute('width',imageWidth);
		svg.setAttribute('height',imageHeight);
		var path = svg.querySelector('path');
		var pathstr = '';
		console.log(retval[0]);
		for (var i=0;i<retval[0].length;i++){
			pathstr += 'M'+retval[0][i]+' ';
		}
		console.log(pathstr);
		path.setAttribute('d',pathstr);
		
		//console.log(retval[0]);
	}
}

function makelines(actwidth,actheight,nrows,ncols) {
	var vlines = [];
	var hlines = [];

	width = 1;
	height = 1;
	
	var conversions = {};
	for (var i=0;i<nrows*ncols;i++){

		conversions['video'+i]=[0];
		conversions['video'+i].push(0);
		conversions['video'+i].push(i%(ncols)); //column within full gif
		conversions['video'+i].push(Math.floor(i/(ncols))%(nrows)); //row within full gif;
		

		
		const x0 = conversions['video'+i][0]+conversions['video'+i][2]*width/ncols;
		const y0 = conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows);
		const x1 = x0+width/ncols;
		const y1 = y0+height/(nrows);


		var line1 = x0+','+y0+' '+x0+','+y1+' ';
		
		var line2 = getRightLine(x0,x1,y0,y1,i,ncols);
		
		
		if (i%ncols > 0){ //not first column
			var newLine = flipRightVertical(vlines[i-1][1].split(' '),x0,y1);
			vlines.push([newLine,line2])
		}
		else {
			vlines.push([line1,line2])
		}

		line2 = x1+','+y0+' '+x0+','+y0+' ';
		line1 = getBottomLine(x0,x1,y0,y1,i,ncols,nrows);

		if (i >= ncols){ //not first row
			var newLine = flipBottomHorizontal(hlines[i-ncols][0].split(' '),x0,y0);
			hlines.push([line1,newLine])
		}
		else {
			hlines.push([line1,line2])
		}

		
	}

	
	return [vlines,hlines,nrows*ncols];
}
function getBottomLine(x0,x1,y0,y1,i,ncols,nrows){
	var line = x0+','+y1+' '+x1+','+y1+' ';
	return line;
}
function getRightLine(x0,x1,y0,y1,i,ncols){
	var line = x1+','+y1+' ' + x1+','+y0+' ';
	return line;
}
function flipBottomHorizontal(oldLine,x0,y0) {
	var oldx0 = parseFloat(oldLine[0].split(',')[0]);
	var oldy1 = parseFloat(oldLine[0].split(',')[1]);
	var newLine = '';
	for (var ii=oldLine.length-1;ii>=0;ii--){
		if (oldLine[ii].indexOf(',')>0){
			var newx = parseFloat(oldLine[ii].split(',')[0]);
			var linex = newx-oldx0+parseFloat(x0);//old x0 should be new x0
			var newy = parseFloat(oldLine[ii].split(',')[1]);
			var liney = newy-oldy1+parseFloat(y0);//old y1 should be new y0
			newLine += linex+','+liney+' ';
		}
	}
	return newLine;
}
function flipRightVertical(oldLine,x0,y1) {
	var oldx1 = parseFloat(oldLine[0].split(',')[0]);
	var oldy1 = parseFloat(oldLine[0].split(',')[1]);
	var newLine = '';
	for (var ii=oldLine.length-1;ii>=0;ii--){
		if (oldLine[ii].indexOf(',')>0){
			var newx = parseFloat(oldLine[ii].split(',')[0]);
			var linex = newx-oldx1+parseFloat(x0);//old x1 should be new x0
			var newy = parseFloat(oldLine[ii].split(',')[1]);
			var liney = newy-oldy1+parseFloat(y1);//old y1 should be same as new y1
			newLine += linex+','+liney+' ';
		}
	}
	return newLine;
}
document.getElementById('npieces').addEventListener('change',updateNpieces);
document.getElementById('size').addEventListener('change',updateSize);