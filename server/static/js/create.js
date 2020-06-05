var ws = new WebSocket('wss://gifsaw.com:8080');
ws.onopen = function(evt) {
	var jsonmessage = {'type':'key'};
	jsonmessage.message = 'tkey';
	ws.send(JSON.stringify(jsonmessage));
}
ws.onmessage = function(evt){
	var dm = JSON.parse(evt.data);
	console.log(dm);
	//var el = document.getElementById('imageHolder');
	var img = document.getElementById('imageHolder').querySelector('img');
	
	img.setAttribute('src',dm.src+"?"+Math.floor(Math.random()*10000));

	img.addEventListener('load',refreshImg);
	
	//el.innerHTML = '';
	//el.appendChild(img);
	document.querySelector('input[name="fileSrc"]').setAttribute('value',dm.src);
	
	setTimeout(refreshImg,100);
	
}
document.getElementById('radio13-1').addEventListener('click',refreshImg);
document.getElementById('radio13-2').addEventListener('click',refreshImg);
document.getElementById('radio13-3').addEventListener('click',refreshImg);
function refreshImg() {
	var img = document.getElementById('imageHolder').querySelector('img');
	img.removeAttribute('width');
	img.removeAttribute('height');
	var fullel = img.parentElement.parentElement.parentElement;
	var titleel = img.parentElement.parentElement.parentElement.querySelector('.title');
	var availWidth = fullel.clientWidth;
	var availHeight = fullel.clientHeight-titleel.clientHeight - 16;
	if (img.height>availHeight || img.width > availWidth){
		var imgRatio = img.height/img.width;
		if (img.height/availHeight > img.width / availWidth){
			img.height = availHeight;
			img.width = img.height/imgRatio;
		}
		else {
			img.width = availWidth;
			img.height = img.width*imgRatio;
		}
	}
	document.getElementById('imageHolder').style.height= img.height+'px';
	document.getElementById('imageHolder').style.width= img.width+'px';
}
var imageHeight = false;
var imageWidth = false;
var dimensions = [];
function updateNpieces(updaten=true,nrows=0,ncols=0) {
	var npieces = document.getElementById('npieces').value;
	var img = document.getElementById('imageHolder').querySelector('img');
	if (img){
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
	if (!updaten){
		var option = document.createElement('option');
		option.value = nrows+'x'+ncols;
		option.textContent = nrows+' x '+ncols + ' ('+(nrows*ncols)+' pieces)';
		el.appendChild(option);
	}
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
	document.getElementById('nrowsForm').value = nrows;
	document.getElementById('ncolsForm').value = ncols;
	
	updateLines();
	
}
function updateLines(evt) {

	
	var img = document.getElementById('imageHolder').querySelector('img');
	var nrows = parseInt(document.getElementById('nrows').value);
	var ncols = parseInt(document.getElementById('ncols').value);
	if (isNaN(nrows) || isNaN(ncols)){
		return;
	}
	document.getElementById('npieces').value = parseInt(nrows*ncols);
	if (evt && evt =='initial'){
		updateNpieces(false,nrows,ncols);
		document.getElementById('nrowsForm').value = nrows;
		document.getElementById('ncolsForm').value = ncols;
	}
	
	var pointyFactor = parseFloat(document.getElementById('pointyFactor').value)/40 - (50/40-.4);
	if (parseFloat(document.getElementById('pointyFactor').value)<50){
		pointyFactor = parseFloat(document.getElementById('pointyFactor').value)/150 - (50/150-.4);
	}
	var hf = 100-parseFloat(document.getElementById('heightFactor').value);
	var heightFactor = hf/7-(50/7-2.5);
	if (hf<50){
		heightFactor = hf/25 - (50/25-2.5);
	}
	var wf = 100-parseFloat(document.getElementById('widthFactor').value);
	var widthFactor = wf/9-(50/9-5);
	if (wf<50){
		widthFactor = wf/15 - (50/15-5);
	}
	if (evt && evt == 'initial'){
		document.getElementById('pointyFactorForm').value = document.getElementById('pointyFactor').value;
		document.getElementById('heightFactorForm').value = document.getElementById('heightFactor').value;
		document.getElementById('widthFactorForm').value = document.getElementById('widthFactor').value;
	}
	else if (evt && (evt.target.id == 'pointyFactor' || evt.target.id == 'heightFactor' || evt.target.id == 'widthFactor')){
		if (evt.target.id == 'pointyFactor') {document.getElementById(evt.target.id+'Form').value = document.getElementById(evt.target.id).value;}
		if (evt.target.id == 'heightFactor') {document.getElementById(evt.target.id+'Form').value = document.getElementById(evt.target.id).value;}
		if (evt.target.id == 'widthFactor') {document.getElementById(evt.target.id+'Form').value = document.getElementById(evt.target.id).value;}
		
	}
	
	if (img){
		imageHeight = img.height;
		imageWidth = img.width;
		
		var retval = makelines(imageWidth,imageHeight,nrows,ncols,pointyFactor,heightFactor,widthFactor);
		var svg = document.getElementById('imageHolder').querySelector('svg');
		document.getElementById('imageHolder').style.height= imageHeight+'px';
		document.getElementById('imageHolder').style.width= imageWidth+'px';
		svg.setAttribute('width',imageWidth);
		svg.setAttribute('height',imageHeight);
		svg.setAttribute('viewBox',"0 0 "+imageWidth+" "+imageHeight);
		
		var path = svg.querySelector('path');
		var pathstr = '';
		for (var i=0;i<retval.length;i++){
			pathstr += 'M'+retval[i][0]+' ';
			pathstr += 'M'+retval[i][1]+' ';
			pathstr += 'M'+retval[i][2]+' ';
			pathstr += 'M'+retval[i][3]+' ';
		}
		path.setAttribute('d',pathstr);
		//var sw = Math.max(imageWidth,imageHeight)/200;
		var sw = 2;
		path.setAttribute('stroke-width',sw);
		
		//console.log(retval[0]);
	}
}

function makelines(actwidth,actheight,nrows,ncols,pointyFactor,heightFactor,widthFactor) {
	var lines = [];

	width = actwidth;
	height = actheight;
	
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

		
		if ((i%ncols)%2 == Math.floor(i/ncols)%2){
			var left = x0+','+y0+' '+x0+','+y1+' ';
			
		
			var right = getRightLine(x0,x1,y0,y1,i,ncols,actwidth,actheight,pointyFactor,heightFactor,widthFactor);
			var top = x1+','+y0+' '+x0+','+y0+' ';
			var bottom = getBottomLine(x0,x1,y0,y1,i,ncols,nrows,actwidth,actheight,pointyFactor,heightFactor,widthFactor);
			var piecelines = [];
			if (i%ncols > 0){ //not first column
				piecelines.push(lines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			piecelines.push(bottom);
			piecelines.push(right);
			if (i >= ncols){ //not first row
				piecelines.push(lines[i-ncols][3]);
			}
			else {
				//hlines.push([line1,line2])
				piecelines.push(top);
			}
			lines.push(piecelines);
		}
		else {
			var left = x0+','+y1+' '+x0+','+y0+' ';
			var right = getRightLine(x0,x1,y1,y0,i,ncols,actwidth,actheight,pointyFactor,heightFactor,widthFactor);
			var top = x0+','+y0+' '+x1+','+y0+' ';
			var bottom = getBottomLine(x1,x0,y0,y1,i,ncols,nrows,actwidth,actheight,pointyFactor,heightFactor,widthFactor);
			
			var piecelines = [];
			if (i%ncols > 0){ //not first column
				//var newLine = flipRightVertical(vlines[i-1][1].split(' '),x0,y1);
				//vlines.push([newLine,line2])
				piecelines.push(lines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			if (i >= ncols){ //not first row
				//var newLine = flipBottomHorizontal(hlines[i-ncols][0].split(' '),x0,y0);
				//hlines.push([line1,newLine])
				piecelines.push(lines[i-ncols][1]);
			}
			else {
				//hlines.push([line1,line2])
				piecelines.push(top);
			}
			piecelines.push(right);
			piecelines.push(bottom);
			
			
			
			lines.push(piecelines);
		}
		


		
	}

	
	return lines;
}
function getBottomLine(x0,x1,y0,y1,i,ncols,nrows,actwidth,actheight,pointyFactor,heightFactor,widthFactor){
	var line = x0+','+y1+' '+x1+','+y1+' ';
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (x0+x1)/2;
	
	ww = w;
	if (x0>x1){ww = -1*w;}
	/*if (actwidth>actheight){
		ww /= actwidth/actheight;
	}
	else {
		w /= actheight/actwidth;
	}*/
	w /= heightFactor;
	ww /= widthFactor;
	line = x0+','+y1+' ';
	line += (c-ww)+','+y1+' ';
	line += 'C'+(c-ww/pointyFactor)+','+(y1+w)+' ';
	line += (c+ww/pointyFactor)+','+(y1+w)+' ';
	line += (c+ww)+','+y1+' ';
	line += 'L'+x1+','+y1+' ';
	if (i/ncols >= nrows-1){
		line = x0+','+y1+' '+x1+','+y1+' ';
	}
	return line;
}
function getRightLine(x0,x1,y0,y1,i,ncols,actwidth,actheight,pointyFactor,heightFactor,widthFactor){
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (y0+y1)/2;
	ww = w;
	if (y1>y0){ww = -1*w;}
	/*if (actwidth>actheight){
		w /= actwidth/actheight;
	}
	else {
		ww /= actheight/actwidth;
	}*/
	w /= heightFactor;
	ww /= widthFactor;
	line = x1+','+y1+' ';
	line += (x1)+','+(c-ww)+' ';
	line += 'C'+(x1+w)+','+(c-ww/pointyFactor)+' ';
	line += (x1+w)+','+(c+ww/pointyFactor)+' ';
	line += (x1)+','+(c+ww)+' ';
	line += 'L'+x1+','+y0+' ';
	if (i%ncols == ncols-1){
		line = x1+','+y1+' ' + x1+','+y0+' ';
	}
	return line;
}
document.getElementById('npieces').addEventListener('change',updateNpieces);
document.getElementById('size').addEventListener('change',updateSize);
document.getElementById('nrows').addEventListener('change',updateLines);
document.getElementById('ncols').addEventListener('change',updateLines);
document.getElementById('pointyFactor').addEventListener('change',updateLines);
document.getElementById('heightFactor').addEventListener('change',updateLines);
document.getElementById('widthFactor').addEventListener('change',updateLines);
document.getElementById('pointyFactor').addEventListener('input',updateLines);
document.getElementById('heightFactor').addEventListener('input',updateLines);
document.getElementById('widthFactor').addEventListener('input',updateLines);

function updateScript(evt) {
	var el1 = document.getElementById('scriptTextarea');
	var el2 = document.getElementById('initialScript');
	if (evt && evt.target.id == 'scoring'){
		var id = evt.target.value;
		el1.value = defaultScripts[id];
		var code = el1.value;

		if (/\n$/.test(el1.value)) {
			code += "\u200b";
		}
		console.log(code);
		document.querySelector('code').textContent = code;

		Prism.highlightElement(document.querySelector('code'));
	}
	
	el2.setAttribute('value',el1.value);
}
document.getElementById('scriptTextarea').addEventListener('change',updateScript);
document.getElementById('scriptTextarea').addEventListener('input',updateScript);

document.getElementById('scoring').addEventListener('change',updateScript);

var img = document.getElementById('imageHolder').querySelector('img');

img.addEventListener('load',refreshImg);

document.querySelector('input[name="fileSrc"]').setAttribute('value',img.getAttribute('src'));

setTimeout(refreshImg,100);

updateLines('initial');
updateScript();

function updateName() {
	document.querySelector('input[name="name"]').value = document.getElementById('name').value;
}
document.getElementById('name').addEventListener('change',updateName);

