function saveFormula(category="image") {
	var wxml;
	var formulaType = 'hsl';
	if (blurOrText == 'blur'){
		if (imgData.blurType == 'hsl'){
			wxml = Blockly.Xml.workspaceToDom(workspaceB);
		}
		else{
			wxml = Blockly.Xml.workspaceToDom(workspaceBRGB);
			formulaType = 'rgb';
		}
	}
	else {
		if (imgData.blurType == 'hsl'){
			wxml = Blockly.Xml.workspaceToDom(workspaceT);
		}
		else{
			wxml = Blockly.Xml.workspaceToDom(workspaceTRGB);
			formulaType = 'rgb';
		}
	}
	
	var outspace = Blockly.Xml.domToText(wxml);
	var jsonmessage = {'type':'saveFormula','name':'First Formula','message':outspace,'formulaType':formulaType,'category':category};
	ws.send(JSON.stringify(jsonmessage));
}

function saveTemplate() {
	var jsonmessage = {'type':'saveTemplate','name':'First Template','message':imgData};
	ws.send(JSON.stringify(jsonmessage));
}