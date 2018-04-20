//OpenC2 Command Generation Tool
//Copyright (C) 2018  Efrain Ortiz

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published
//by the Free Software Foundation, either version 3 of the License, or
//any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

var xhttp = new XMLHttpRequest();
var openc2command = {
	"id": "",
	"action": "",
	"target": {},
	"actuator": {}
};
var curlCode = '';
var nodeJsCode = '';
var pythonCode = '';
var codes = [];
var valueTypes = {};


	var jsonjadn = $.getJSON("assets/openc2.json", function (data) {

		$.each(jsonjadn.responseJSON.types, function(i, item) {
			valueTypes[item[0]] = item[1];
		});
		var actuator_specifiers = jsonjadn.responseJSON.types[7][4]; //retrieves actuator_specifiers
		var unsortedActions = jsonjadn.responseJSON.types[4][4]; //retrieves actions
		var unsortedTargets = jsonjadn.responseJSON.types[5][4]; //retrieves targets
		var allTargetSpecifiers = jsonjadn.responseJSON.types[5][4];
		codes['encryption_algorithm'] = jsonjadn.responseJSON.types[28][4];
		codes['hashes'] = jsonjadn.responseJSON.types[27][4];
		var allUnsortedActions = [];
		i = 0;
		while (i < unsortedActions.length) {
			allUnsortedActions.push(unsortedActions[i][1]);
			i++;
		}
		var allActions = allUnsortedActions.sort();
		var allUnsortedTargets = [];
		i = 0;
		while (i < unsortedTargets.length) {
			allUnsortedTargets.push(unsortedTargets[i][2]);
			i++;
		}
		var allTargets = allUnsortedTargets.sort();
	
		var allActuators = jsonjadn.responseJSON.types[6][4];
	
		var allActuatorSpecifiers = jsonjadn.responseJSON.types[7][4];
	
		$.each(allActions, function (i, item) {
			$('#actionId').append('<a class="dropdown-item actionDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		$.each(allTargets, function (i, item) {
			$('#targetId').append('<a class="dropdown-item targetDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		$.each(allTargetSpecifiers, function (i, item) {
			$('#targetSpecifiersId').append('<a class="dropdown-item targetSpecifierDropDownMenu" role="presentation" href="#" id=' + item[1] + "SelectionId" + '>' + item[1] + '</a>');
		});
		$.each(allActuators, function (i, item) {
			$('#actuatorId').append('<a class="dropdown-item actuatorDropDownMenu" role="presentation" href="#" id=' + item[1] + "SelectionId" + '>' + item[1] + '</a>');
		});
		$.each(allActuatorSpecifiers, function (i, item) {
			$('#actuatorSpecifierId').append('<a class="dropdown-item actuatorSpecifierDropDownMenu" role="presentation" href="#" id=' + item[1] + "SelectionId" + '>' + item[1] + '</a>');
		});
	});
	$(document).ready(function () {
	$('.dropdown-item').on('click', (function () {
		event.preventDefault();
		switch (($(this).attr('class').split(' '))[1]) {
			case 'actionDropDownMenu':
				actionFunction(this.text);
				break;
			case 'targetDropDownMenu':
				targetFunction(this.text);
				break;
			case 'targetSpecifierDropDownMenu':
				sentencetargetspecifierFunction(this.text);
				break;
			case 'targetValueDropDownMenu':
				sentenceTargetSpecifiervalueFunction(this.text);
				break;
			case 'actuatorDropDownMenu':
				actuatorFunction(this.text);
				break;
			case 'actuatorValueDropDownMenu':
				actuatorValueDropDownMenuFunction(this.text);
				break;

			case 'actuatorSpecifierDropDownMenu':
				actuatorSpecifierDropDownMenuFunction(this.text);
				break;
			case 'actuatorSpecifierValueDropDownMenu':
				actuatorSpecifierValueDropDownMenuFunction(this.text);
				break;
			default:
				break;
		}
	}));

	$('.targetDropDownMenu').on('click', function () {
		event.preventDefault();
		$.each(jsonjadn.responseJSON.types, function (i, v) {
			var valueT = targetButtonId.innerText;
			if (v[0] == valueT && (v[1] == 'Map' || v[1] == 'Record' || v[1] == 'Choice')) {
				$('.targetUpdateRow').remove();
				$('#targetOptionButtonId').remove();
				$('.targetRow').after('<tr class="targetUpdateRow"><td>with a specific target type of </td><td><div> <div id="targetOptionButtonId">' + v[0].toUpperCase() + ' Options</div>');
				singleInputTargetRow(v);
			}
			if (v[0] == valueT && v[1] == 'String') {
				$('.targetUpdateRow').remove();
				$('#targetOptionButtonId').remove();
				$('.targetRow').after('<tr class="targetUpdateRow"><td>with a specific target value of </td><td><div> <div id="targetOptionButtonId">' + v[0].toUpperCase() + ' Options</div>');
				$('#targetOptionButtonId').after('<tr><td><div class="form"><label for="' + valueT + 'formCheck" >' + valueT + '</label></div></td><td id="' + valueT + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + valueT + '" onchange="updateInputValues(this)" id="' + valueT + '_inputString" type="text" minlength="1" tabindex="-1"/>	</td></tr>');
				if ('data' != 'data') {
					$('#targetOptionButtonId').after('<input class="dropdown-item" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + valueT + '" onchange="updateValues(this)" id="' + valueT + '_inputString" type="text" minlength="1" tabindex="-1"/>	</td></tr>');
				}
			}
		})
	});
	function singleInputTargetRow(v) {
		event.preventDefault();
		$.each(v[4], function (j, w) {
			asteriskChecker = asteriskCheck(w);
			if (w[1] == 'encryption_algorithm') {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle" data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >' + w[1] + '</button></div></div></td></tr>');
				$('#' + asteriskChecker + "_MenuList").append('<div class="dropdown-menu asteriskChecker_Class" id="' + asteriskChecker + '_Menu"></div>')

				$.each(codes[w[1]], function (i, item) {
					$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" id=' + item[1] + "SelectionId" + ' onclick="updateValues(this)">' + item[1] + '</a>');
				});
			} else if (w[1] == 'hashes' || (w[1] == 'hash')) {
				$('#targetOptionButtonId').after('<tr id="hashContent"><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD" class="hashContent"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle " data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >' + w[1] + '</button></div></div></td></tr>');
				$('#' + asteriskChecker + "_MenuList").append('<div class="dropdown-menu asteriskChecker_Class hashTypes" id="' + asteriskChecker + '_Menu"></div>')

				$.each(codes[w[1]], function (i, item) {
					$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" id=' + item[1] + "SelectionId" + ' onclick="updateValues(this)">' + item[1] + '</a>');
				});
				$('#' + asteriskChecker + '_TD').after('<td class="hashTypes hashContent"><input class="hashTypes inputString input-disabled' + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" type="text" minlength="1" tabindex="-1" value=""/><i class="hashTypes fa fa-plus-circle hashContent input-disabled" onclick="createNewHashRow(this)" style="color:rgb(40,167,69);font-size:46;"></i></td>');
			} else if (w[1] != 'encryption_algorithm' && w[1] != 'hashes' && w[1] != 'hash' && (w[2] == "Null" || w[2] == "comm-selected")) {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"></td></tr>');
			} else if (w[1] != 'encryption_algorithm' && w[1] != 'hashes' && w[1] != 'hash' && (w[2] != "comm-selected" || (w[2] != "comm-selected"))) {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" id="' + asteriskChecker + '_inputString" type="text" minlength="1" tabindex="-1" value=""/></td></tr>');
			}
			
			box = asteriskChecker + '_inputString'
			$('#' + box).addClass('input-disabled');
		});
	}
})
function getRandomNumber() {
	value = '';
	i = 0
	while (i < 32) {
		value = Math.floor(Math.random() * 10) + '' + value;
		i++;
	}
	return value
}
$("#executeNowId").on('click', (function () {
	var oc2Server = $('#oc2ServerId').val();
	var oc2ServerAPIKeyId = $('#oc2ServerKeyId').val();
	var oc2ServerAPI = {};
	oc2ServerAPI['oc2-api-key'] = $('#oc2ServerKeyId').val();
	//console.log('Execute Clicked');
	xhttp.open("POST", oc2Server, true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.setRequestHeader('oc2-api-key', oc2ServerAPIKeyId);

	xhttp.onreadystatechange = function () {
		if (this.readyState !== 4)
			return;
		if (this.status === 200) {
			alert(this.responseText);
		} else {
			alert('ERROR!!!!');
		}
	};
	xhttp.send(JSON.stringify(openc2command));
}));
$("#resetSelectionsId").click(function () {
	$('#actuator_id').prop("checked", false);
	$('#asset_id').prop("checked", false);
	$('#actionButtonId').text('action');
	$('#targetButtonId').text('target');
	$('#target_specifierButtonId').text('target_specifier');
	$('#targetValueButtonId').text('select value');
	$('#actuatorButtonId').text('actuator');
	$('#actuatorValueButtonId').text('select value');
	$('#actuatorSpecifierButtonId').text('actuator_specifier');
	$('#actuatorSpecifierValueButtonId').text('select value');
	$('#commandSampleContentPre').text('{}');
	$('#sentenceAction').text('{action}');
	$('#sentenceTarget').text('{target}');
	$('#sentencetarget_specifier').text('{target_specifier}');
	$('#sentenceTarget_Specifier_value').text('{value}');
	$('#sentenceActuator').text('{actuator}');
	$('#sentenceActuatorValue').text('{value}');
	$('#sentenceActuatorSpecifier').text('{actuator_specifier}');
	$('#sentenceActuatorSpecifierValue').text('{value}');
	$('#commandSampleContentPre').text('{}');
	openc2command = {
		"id": "",
		"action": "",
		"target": {},
		"actuator": {},
	};
	$('.targetUpdateRow').remove();
	$('.actuatorSpecifierRow').remove();
	$('#curlCodeText').text('');
	$('#pythonCodeText').text('');
	$('#nodejsCodeText').text('');
	$('#viewSampleCommandId').addClass('collapsed');
	$('#viewSampleCommandId').prop('aria-expanded', "false");
	$('#collapse-1').removeClass('show');
	$('#sampleCodeDownloadId').addClass('collapsed');
	$('#sampleCodeDownloadId').prop('aria-expanded', "false");
	$('#collapse-2').removeClass('show');
	$('#collapse-3').removeClass('show');
});
function sampleCodeGenerate(jsonPrettified) {
	var oc2Server = $('#oc2ServerId').val();
	var oc2ServerAPIKeyId = $('#oc2ServerKeyId').val();
	//console.log('json pretty is: ' + jsonPrettified);
	var curlCode = "curl -X POST " + oc2Server + " \\<br>\
-H 'Cache-Control: no-cache' \\<br>\
-H 'Content-Type: application/json' \\<br>\
-H 'oc2-api-key: " + oc2ServerAPIKeyId + "' \\<br>\
-d '"
	var curlCodePretty = JSON.stringify(jsonPrettified, null, 2);
	var curlclosing = "'\n";
	$('#curlCodeText').html("".concat(curlCode, jsonPrettified, curlclosing));
	var nodeJsCode = "var request = require('request');\n\
var options = { method: 'POST',\n\
url: '" + oc2Server + "',\n\
headers: \
{ 'oc2-api-key': '" + oc2ServerAPIKeyId + "',\n\
'Content-Type': 'application/json' },\n\
body: \n"
	var nodeJSclosing = ",\njson: true };\n\
request(options, function (error, response, body) {\n\
if (error) throw new Error(error);\n\
console.log(body);\n\
});"
	$('#nodejsCodeText').text("".concat(nodeJsCode, jsonPrettified, nodeJSclosing));
	//pythonCode = 'import requests \nurl = "' + oc2Server + '" \n\n\ payload = "'
	var pythonCode = 'import requests\ \nurl = "' + oc2Server + '" \npayload = \''
	var headers = {}
	headers['Content-Type'] = "application/json"
	headers['oc2-api-key'] = oc2ServerAPIKeyId
	headers['Cache-Control'] = "no-cache"
	var headersString = 'headers = ' + JSON.stringify(headers);
	var pythonEnd = 'response = requests.request("POST", url, data=payload, headers=headers)'
	var payload = JSON.stringify(openc2command, null, 2);
	var jsonPrettified = jsonPrettified.replace(/\n/g, "\\\<br>")
	$('#pythonCodeText').html("".concat(pythonCode, jsonPrettified, '\'\n', headersString, '\n', pythonEnd, '\n', 'print(response.text)'));
	$('#viewSampleCommandId').removeClass('collapsed');
	$('#viewSampleCommandId').prop('aria-expanded', "true");
	$('#collapse-1').addClass('show');
	$('#sampleCodeDownloadId').removeClass('collapsed');
	$('#sampleCodeDownloadId').prop('aria-expanded', "true");
	$('#collapse-2').addClass('show');
}
$("#generateCodeId").click(function () {
	openc2command['id'] = getRandomNumber();
	var jsonPrettified = JSON.stringify(openc2command, null, 2);
	$('#commandSampleContentPre').text(jsonPrettified);
	sampleCodeGenerate(jsonPrettified);
});

$("#nodeJsTabId").click(function () {
	//$('#nodejsCodeText').text(nodeJsCode);
});
$("#pythonTabId").click(function () {
	//$('#pythonCodeText').text(pythonCode);
});
$("#curlTabId").click(function () {
	//$('#curlCodeText').text(curlCode);
});
function actionFunction(selectedValue) {
	$('#actionButtonId').text(selectedValue);
	$('#sentenceAction').text(selectedValue);
	openc2command['action'] = selectedValue;
}
function targetFunction(selectedValue) {
	//console.log('selectedValue is ' + selectedValue);
	$('#targetButtonId').text(selectedValue);
	$('#sentenceTarget').text(selectedValue);
	if (valueTypes[selectedValue] == 'String') {
		openc2command['target'] = {};
		openc2command['target'][selectedValue] = "";
	} else if (valueTypes[selectedValue] == 'Map' || valueTypes[selectedValue] == 'Choice' || valueTypes[selectedValue] == 'Record') {
		openc2command['target'] = {};
		openc2command['target'][selectedValue] = {};
	} 
}
function sentencetargetspecifierFunction(selectedValue) {
	$('#target_specifierButtonId').text(selectedValue);
	openc2command['target_specifier'] = selectedValue;
}
function sentenceTargetSpecifiervalueFunction(selectedValue) {
	$('#targetValueButtonId').text(selectedValue);
	$('#sentenceTarget_Specifier_value').text(selectedValue);
}
function actuatorFunction(selectedValue) {
	$('#actuatorButtonId').text(selectedValue);
	openc2command.actuator = JSON.parse('{ "' + selectedValue + '": {}}');
	if ($('#actuatorRow').length == 0) {
		$('.actuatorRow').after('<tr class="actuatorSpecifierRow"><td></td><td><table id="actuatorRow"><tbody><tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="actuator_id" oc2name="actuator_specifier" oc2cmdname="actuator_specifier" onclick="dynamicInputCheck(this)"><label for="actuatorIdCheck">actuator Id</label></div></td><td><input class="inputString input-disabled" oc2name="actuator" oc2checkbox="actuator_id" onchange="updateValues(this)" id="actuator_id_inputString" type="text" minlength="1" tabindex="-1" data-mp-id="actuatorId_inputString"></td></tr><tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="asset_id" oc2name="actuator_specifier" oc2cmdname="actuator_specifier" onclick="dynamicInputCheck(this)"><label for="assetIdCheck">asset Id</label></div></td><td><input class="inputString input-disabled" oc2name="actuator" oc2checkbox="asset_id" oc2cmdname="actuator_specifier" onchange="updateValues(this)" id="asset_id_inputString" type="text" minlength="1" tabindex="-1" data-mp-id="assetId_inputString"></td></tr></tbody></table></td></tr>');
	}
}
function actuatorValueDropDownMenuFunction(selectedValue) {
	$('#actuatorValueButtonId').text(selectedValue);

}
function actuatorSpecifierDropDownMenuFunction(selectedValue) {
	$('#actuatorSpecifierButtonId').text(selectedValue);
	openc2command['actuator_specifier'] = selectedValue;
}
function actuatorSpecifierValueDropDownMenuFunction(selectedValue) {
	$('#actuatorSpecifierValueButtonId').text(selectedValue);
}
function dynamicInputCheck(test) {
	var getCurrentValue = $('#actuatorButtonId')[0].innerText;
	if (test.checked == true) {
		var targetName = test.getAttribute('oc2name');
		var targetOc2name = test.getAttribute('oc2cmdname');
		var capture = '{ ' + test.id + " : " + "" + '}';
		if (test.id != 'any') {
			$('#' + test.id + '_inputString').removeClass('input-disabled');
			$('#' + test.id + '_inputString').attr('readonly', false);
		}
		if (targetName == 'target' && (test.id == 'hashes' || test.id == 'hash')) {
			openc2command[targetName][targetOc2name][test.id] = {}
			$('.hashTypes').removeClass('input-disabled');
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'target' && (test.id != 'hashes' || test.id != 'hash')) {
			openc2command[targetName][targetOc2name][test.id] = ''
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'actuator_specifier') {
			if (test.id == 'actuator_id') {
				openc2command.actuator[getCurrentValue]['actuator_id'] = "";
			}
			if (test.id == 'asset_id') {
				openc2command.actuator[getCurrentValue]['asset_id'] = "";
			}
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
	}
	if (test.checked == false) {
		var targetName = test.getAttribute('oc2name');
		var targetOc2name = test.getAttribute('oc2cmdname');
		$('#' + test.id + '_inputString').addClass('input-disabled');
		if ( test.id == 'hashes'){
			$(test)["0"].parentNode.parentNode.parentNode.children[1].children["0"].children["0"].innerHTML = 'hashes';
			$(test)["0"].parentNode.parentNode.parentNode.children[2].children["0"].value = '';
			$('.newHashTypes').remove();
			$('.hashTypes').addClass('input-disabled');
		}
		if ( test.id == 'hash'){
			$(test)["0"].parentNode.parentNode.parentNode.children[1].children["0"].children["0"].innerHTML = 'hash';
			$(test)["0"].parentNode.parentNode.parentNode.children[2].children["0"].value = '';
			$('.newHashTypes').remove();
			$('.hashTypes').addClass('input-disabled');
		}
		$('#' + test.id + '_inputString').attr('readonly', true);
		$('#' + test.id + '_inputString').attr('tabindex', '-1');
		if (test.id == 'actuator_id') {
			delete openc2command.actuator[getCurrentValue]['actuator_id']
		}
		if (test.id == 'asset_id') {
			delete openc2command.actuator[getCurrentValue]['asset_id']
		}
		if (targetName == 'target') {
			delete openc2command[targetName][targetOc2name][test.id]
		}
	}
}
function updateValues(test) {
	event.preventDefault();
	var chosenAlgorithm = $(test)[0].text;
	var targetName = test.getAttribute('oc2name');
	var targetOc2name = test.getAttribute('oc2cmdname');
	if (targetName == 'target' && test.getAttribute('oc2checkbox') != 'encryption_algorithm' && test.getAttribute('oc2checkbox') != 'hash' && test.getAttribute('oc2checkbox') != 'hashes' && test.getAttribute('oc2checkbox') != 'newhashes') {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = $(test)[0].innerText;
		console.log('triggered newhashes entry');
	}
	if (targetName == 'target' && test.getAttribute('oc2checkbox') == 'encryption_algorithm') {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = $(test)[0].innerText;
		$('#' + test.getAttribute('oc2checkbox') + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'target' && ( test.getAttribute('oc2checkbox') == 'hashes' || test.getAttribute('oc2checkbox') == 'hashes')) {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = {};
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')][chosenAlgorithm] = $('#hashes_inputString')["0"].parentNode.parentNode.nextElementSibling.childNodes["0"].value;
		$('#' + test.getAttribute('oc2checkbox') + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'target' && test.getAttribute('oc2checkbox') == 'newhashes') {
		console.log('newhashes entry in updateValues was triggered');
		openc2command[targetName][targetOc2name]['hashes'][chosenAlgorithm] = '';
		$(test)["0"].parentNode.parentNode.parentNode.parentNode.children[1].childNodes["0"].firstChild.innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'actuator') {
		var getCurrentValue = $('#actuatorButtonId')[0].innerText;
		var oc2checkbox = test.getAttribute('oc2checkbox');
		openc2command['actuator'][getCurrentValue][oc2checkbox] = $(test)[0].value;
	}
}

function asteriskCheck(w) {
	if (w[1] != '*') {
		return w[1]
	} else {
		return 'any'
	}
}
function createNewHashRow(inObject) {
	event.preventDefault();
	var asteriskChecker = "newhashes";
	$('#hashContent').after('<tr class="newHashTypes hashContent extraHashContent"><td><td id="' + asteriskChecker + '_hashTD" class="newHashTypes hashContent"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle " data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="hashes"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >hashes</button></div></div></td></tr>');
	$('#' + asteriskChecker + '_MenuList').append('<div class="dropdown-menu asteriskChecker_Class newHashTypes extraHashContent" id="' + asteriskChecker + '_Menu"></div>')
	$.each(codes['hashes'], function (i, item) {
		$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu extraHashContent newHashTypes" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" onclick="updateValues(this)">' + item[1] + '</a>');
	});
	$('#' + asteriskChecker + '_hashTD').after('<td class="newHashTypes extraHashContent"><input class="hashTypes inputString' + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" type="text" minlength="1" tabindex="-1" value=""/><i class="hashTypes fa fa-minus-circle hashContent" onclick="removeInputHash(this)" style="color:rgb(255,0,0);font-size:46;"></i></td>');
}
function updateInputValues(inObject) {
	if ($(inObject)["0"].attributes['oc2checkbox'].value == "hashes" || $(inObject)["0"].attributes['oc2checkbox'].value == "hash" || $(inObject)["0"].attributes['oc2checkbox'].value == "newhashes") {
		console.log('update Hashes called ' + $(inObject)["0"].parentNode.parentNode.children[1].innerText + ' = ' + $(inObject)["0"].value);
		openc2command['target']['file']['hashes'][$(inObject)["0"].parentNode.parentNode.children[1].innerText] = $(inObject)["0"].value;
		}
	else if ($(inObject)["0"].attributes['oc2checkbox'].value != "hash" && $(inObject)["0"].attributes['oc2checkbox'].value != "hashes" && $(inObject)["0"].attributes['oc2checkbox'].value != "newhashes") {
			console.log('update Hashes called ' + $(inObject)["0"].parentNode.parentNode.children[1].innerText + ' = ' + $(inObject)["0"].value);
			if (valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'String') {
				openc2command[$(inObject)["0"].attributes['oc2name'].value][$(inObject)["0"].attributes['oc2cmdname'].value] = $(inObject)[0].value;
			} else if (valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Map' || valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Record' || valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Choice' ) {
				openc2command[$(inObject)["0"].attributes['oc2name'].value][$(inObject)["0"].attributes['oc2cmdname'].value][$(inObject)["0"].attributes['oc2checkbox'].value] = $(inObject)[0].value;
			}
	}
}
function removeInputHash(inObject) {
		console.log('update Hashes called ' + $(inObject)["0"].parentNode.parentNode.children[1].innerText + ' = ' + $(inObject)["0"].value);
		delete openc2command['target']['file']['hashes'][$(inObject)["0"].parentNode.parentNode.children[1].innerText];
		$(inObject)["0"].parentNode.parentElement.remove();
}