var ws = new WebSocket('wss://matherrors.com:8080');
ws.onopen = function(evt) {
	var jsonmessage = {'type':'key'};
	jsonmessage.message = tkey;
	ws.send(JSON.stringify(jsonmessage));
}
ws.onmessage = function(evt){
	var dm = JSON.parse(evt.data);
	if (dm.type == 'newFormulas'){
		var formulas = dm.formulas;
		console.log(formulas);
		var el = document.getElementById('formulas');
		el.innerHTML = '<input type="radio" name="formula" style="display: none;" id="formula--1" checked="checked"></input>';
		
		for (i in formulas) {
			var input = document.createElement('input');
			input.setAttribute('type','radio');
			input.setAttribute('name','formula');
			input.setAttribute('style','display: none;');
			input.id = 'formula-'+ formulas[i].id;
			el.appendChild(input);
		}
		el.innerHTML += '<label for="formula--1"></label>';
		
		for (i in formulas) {
			var label = document.createElement('label');
			label.classList.add('formulaLabel');
			label.setAttribute('for','formula-'+ formulas[i].id);
			label.textContent = formulas[i].name;
			el.appendChild(label);
			var div = document.createElement('div');
			div.classList.add('formulaCode');
			var div2 = document.createElement('div');
			div2.innerHTML = '<i class="fas fa-trash"></i>';
			div2.innerHTML += '<i class="fas fa-edit"></i>';
			var icon = document.createElement('i');
			icon.classList.add('fas');
			icon.classList.add('fa-copy');
			icon.setAttribute('onclick',"copyFormula('"+ formulas[i].name +"')");
			div2.appendChild(icon);
			div.appendChild(div2);
			var pre = document.createElement('pre');
			pre.classList.add('language-lua');
			var code = document.createElement('code');
			code.classList.add('language-lua');
			code.textContent = formulas[i].code;
			pre.appendChild(code);
			div.appendChild(pre)
			el.appendChild(div);
			
		}
		Prism.highlightAll();
	}
}

function copyFormula(name){
	var jsonmessage = {'type':'copyFormula'};
	jsonmessage.message = name;
	ws.send(JSON.stringify(jsonmessage));
}