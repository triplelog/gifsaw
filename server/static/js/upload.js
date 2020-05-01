/*
var ctypestr = "";
var filen = "";
var syncWorker = new Worker('../wasm/uploadworker.js');
var syncWorker2 = new Worker('../wasm/datatypeworker.js');
*/

document.querySelector('.imgDrag').addEventListener('drop', handleDrop, false);
var names = ['dragenter', 'dragover', 'dragleave', 'drop'];
names.forEach(eventName => {
  document.querySelector('.imgDrag').addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
	e.preventDefault();
    e.stopPropagation();
}
function handleDrop(e) {
  
  let dt = e.dataTransfer;
  let files = dt.files;
  //document.getElementById('dropArea').style.display = 'none';
  var ffile = files[0];
	sendImage(ffile);
	document.getElementById('imgSrc').style.display = 'none';
	document.getElementById('imgUrl').style.display = 'none';
	document.getElementById('imgType').value = 'drag';
	//add message somewhere that image uploaded
}


document.getElementById('imgSrc').addEventListener('change', function(inp) {
	
	//document.getElementById('dropArea').style.display = 'none';
	var ffile = this.files[0];
	
	sendImage(ffile);
	/*
	syncWorker.postMessage(ffile);
	syncWorker.onmessage = function(e) {
		//ctypestr = toTable(e.data.result,e.data.ctypestr);
		
		//if (filen != ""){createConfirmForm();}
		document.getElementById('dataTableModified').innerHTML = '';
		setTimeout(fullCompression,10,ffile);
	};*/
	
	

}, false);

function chgImgType(evt){
	var imgType = evt.target.value;
	if (imgType == 'upload'){
		document.getElementById('imgSrc').style.display = 'inline-block';
		document.getElementById('imgUrl').style.display = 'none';
	}
	else if (imgType == 'url'){
		document.getElementById('imgSrc').style.display = 'none';
		document.getElementById('imgUrl').style.display = 'inline-block';
	}
	else if (imgType == 'drag'){
		document.getElementById('imgSrc').style.display = 'none';
		document.getElementById('imgUrl').style.display = 'none';
	}
}
document.getElementById('imgType').addEventListener('change', chgImgType);

function chgImgUrl(evt) {
	var url = evt.target.value;
	var jsonmessage = {'type':'download','url':url};
	
	ws.send(JSON.stringify(jsonmessage));
}

document.getElementById('imgUrl').addEventListener('change', chgImgUrl);
function sendImage(img) {
	var readerF = new FileReader();
	readerF.onload = function() {

		ws.send(this.result);
	}
	
	readerF.readAsArrayBuffer(img);
}


document.getElementById('imgSrc').style.display = 'inline-block';
document.getElementById('imgUrl').style.display = 'none';

