// OpenC2 Command Generation Tool
// Copyright (C) 2018  Efrain Ortiz
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This prevents the browswer window from resetting to the top of the screen with every click.
function checkBrowser() {
	if (navigator.userAgent.indexOf("Firefox") == -1) {
		event.preventDefault();
	}
}
var xhttp = new XMLHttpRequest();

//This declares the basic openc2 command template.
var openc2command = {
	"action": "",
	"target": {},
	"actuator": {},
	"args": {},
	"command_id": ""
};
//These are declared variables to be used in the rest of the program.
var curlCode = '';
var nodeJsCode = '';
var pythonCode = '';
var codes = [];
var allActuators = [];
var allTargetSpecifiers = [];
var allActions = [];
var allTargets = [];
var allActuatorSpecifiers = [];
var allArgs = [];
var openc2CommandSchema = new Array();
var definitions = [];

// This document ready will first load an external json file with the openc2 schema before executing the whenReady segment.
$(document).ready(function () {
	$.getJSON('assets/command.json', function (command) {
		openc2CommandSchema = command;
	})
		.done(function () {
			whenReady();
			readIn();

		});
}());


//When the browser loads this calls the readIn function to parse the openc2 command.

function whenReady() {
	// This section declares what happends when a dropdown-item is clicked.
	function dropdownItem() {
		$('.dropdown-item').on('click', (function (event) {
			checkBrowser(event);
			switch (($(this).attr('class').split(' '))[1]) {
				case 'actionDropDownMenu':
					actionFunction(this.text);
					break;
				case 'targetDropDownMenu':
					targetFunction(this.text);
					break;
				case 'actuatorDropDownMenu':
					actuatorFunction(this.text);
					break;
				case 'argsButtonId':
					argsButton(this.text);
					break;
				default:
					break;
			}
		}));
		return false;
	};
	// This funtion is a special handler for the args button, which does not have a drop down button. The args button simply adds the arguments options.
	function argsButton() {
		$('#argsButtonId').on('click', function (event) {
			var valueT = argsButtonId.innerText;
			argsdefinitions = openc2CommandSchema.definitions.args.properties;
			checkBrowser();
			$('.newargsRow').remove();
			openc2command.args = {};
			$('.argsRow').after('<tr class="newargsRow"><td></td><td><div> <div id="argsOptionButtonId">' + valueT.toUpperCase() + ' Options</div>');
			$.each(argsdefinitions, function (i, v) {
				$('#argsOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + 'args_' + i + '" oc2name="args" oc2cmdname=' + $('#argsButtonId')[0].innerText + ' oc2endname="' + i + '" onclick="dynamicInputCheck(this)"/><label for="' + i + 'formCheck" >' + i + '</label></div></td><td id="' + 'args_' + i + '_TD"><input class="inputString input-disabled" oc2name="args" oc2cmdname=' + $('#argsButtonId')[0].innerText + ' oc2checkbox="' + i + '" oc2endname="' + i + '" onchange="updateInputValues(this)" id="' + 'args_' + i + '_inputString" type="' + inputTypeCheck(v) + '" minlength="1" tabindex="-1" value=""/></td></tr>');
			});
		});
		return false;
	};
	function populateFields() {
		argetSpecifiers = openc2CommandSchema.definitions.target.properties;
		codes['hashes'] = openc2CommandSchema.definitions.hashes.properties;
		i = 0;
		var allActions = openc2CommandSchema.definitions.action.enum.sort();
		$.each(openc2CommandSchema.definitions.target.properties, function (i, target) {
			allTargets.push(i);
		});
		$.each(openc2CommandSchema.definitions.actuator.properties, function (i, actuator) {
			allActuators.push(i);
		});
		$.each(openc2CommandSchema.definitions.args.properties, function (i, args) {
			allArgs.push(i);
		});
		allActuatorSpecifiers = openc2CommandSchema.definitions.actuator.properties;
		$.each(allActions, function (i, item) {
			$('#actionId').append('<a class="dropdown-item actionDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		$.each(allTargets, function (i, item) {
			$('#targetId').append('<a class="dropdown-item targetDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		$.each(allActuators, function (i, item) {
			$('#actuatorId').append('<a class="dropdown-item actuatorDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		$.each(allArgs, function (i, item) {
			$('#argsId').append('<a class="dropdown-item argsSpecifierDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		});
		dropdownItem(openc2CommandSchema);
		targetDropDown(openc2CommandSchema);
		return false;
	}

	function targetDropDown(openc2CommandSchema) {
		$('.targetDropDownMenu').on('click', function (event) {
			definitions = openc2CommandSchema.definitions;
			checkBrowser();
			$.each(openc2CommandSchema.definitions, function (i, v) {
				var valueT = targetButtonId.innerText;
				if (i == valueT && v['type'] == 'object') {
					$('.targetUpdateRow').remove();
					$('#targetOptionButtonId').remove();
					$('.targetRow').after('<tr class="targetUpdateRow"><td>with a specific target type of </td><td><div> <div id="targetOptionButtonId">' + valueT.toUpperCase() + ' Options</div>');
					singleInputTargetRow(v);
				}
				if (i == valueT && (v['type'] == 'string' || v['type'] == 'integer')) {
					$('.targetUpdateRow').remove();
					$('#targetOptionButtonId').remove();
					$('.targetRow').after('<tr class="targetUpdateRow"><td>with a specific target value of </td><td><div> <div id="targetOptionButtonId">' + valueT.toUpperCase() + ' Options</div>');
					$('#targetOptionButtonId').after('<tr><td><div class="form"><label for="' + valueT + 'formCheck" >' + valueT + '</label></div></td><td id="' + 'target_' + valueT + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + valueT + '" oc2endname="' + i + '" onchange="updateInputValues(this)" id="' + 'target_' + valueT + '_inputString" type="' + inputTypeCheck(v) + '" minlength="1" tabindex="-1"/>	</td></tr>');
				}
				if (i == valueT && v['type'] == 'array') {
					$('.targetUpdateRow').remove();
					$('#targetOptionButtonId').remove();
					$('.targetRow').after('<tr class="targetUpdateRow"><td>with a specific target type of </td><td><div> <div id="targetOptionButtonId">' + valueT.toUpperCase() + ' Options</div>');
					singleInputTargetRow(v);
				}
			});
		});
		return false;
	};
	function singleInputTargetRow(v) {
		if (v.type == 'object') {
			$.each(v.properties, function (j, w) {
				var asteriskChecker = asteriskCheck(j);
				if (j == 'hashes') {
					$('#targetOptionButtonId').after('<tr id="hashContent"><td><div class="form"><input class="dynamicInput" type="checkbox" id="target_' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2endname="' + asteriskChecker + '" onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="target_' + j + '_TD" class="hashContent"><div class="dropdown" id="target_' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle " data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '"  id="target_' + asteriskChecker + '_inputString" oc2endname="' + asteriskChecker + '" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >' + j + '</button></div></div></td></tr>');
					$('#' + 'target_' + asteriskChecker + "_MenuList").append('<div class="dropdown-menu ' + asteriskChecker + '_Class hashTypes" id="' + 'target_' + asteriskChecker + '_Menu"></div>');

					$.each(codes[j], function (i, item) {
						$('#target_' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" id="' + i + 'SelectionId"' + ' oc2endname="' + asteriskChecker + '" onclick="updateValues(this)">' + i + '</a>');
					});
					$('#target_' + asteriskChecker + '_TD').after('<td class="hashTypes hashContent"><input id="target_hashtype" class="hashTypes inputString input-disabled' + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" oc2endname="' + asteriskChecker + '" onchange="updateInputValues(this)" type="text" minlength="1" tabindex="-1" value=""/></i></td>');
				}
				else {
					$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + 'target_' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2endname="' + asteriskChecker + '" onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + 'target_' + asteriskChecker + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" oc2endname="' + asteriskChecker + '" onchange="updateInputValues(this)" id="' + 'target_' + asteriskChecker + '_inputString" type="' + inputTypeCheck(v.properties[j]) + '" minlength="1" tabindex="-1" value=""/></td></tr>');
				};
				box = 'target_' + asteriskChecker + '_inputString';
				$('#' + box).addClass('input-disabled');
			});
		}
		if (v.type == 'array' && v.title != 'OpenC2 Properties') {
			$.each(v.items.enum, function (k, x) {
				$('#targetOptionButtonId').after('<tr id="features_Content"><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + x + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2endname="' + x + '" onclick="dynamicInputCheck(this)"/><label for="featuresformCheck" >' + x + '</label></div></td><td id="' + x + '_TD" class="features"></div></td></tr>');
			});
		};
		if (v.type == 'array' && v.title == 'OpenC2 Properties') {
			$('#targetOptionButtonId').after('<label for="propertiesformCheck" >properties : </label></div></td><td id="target_properties_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="properties" oc2endname="properties" onchange="updateInputValues(this)" id="' + 'target_properties_inputString" type="text" minlength="1" tabindex="-1" value=""/></td></tr>');

		};
		if (v.type == 'string') {
			$.each(v.items.enum, function (k, x) {
				$('#targetOptionButtonId').after('<tr id="features_Content"><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + x + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + 'oc2endname=' + x + ' onclick="dynamicInputCheck(this)"/><label for="' + x + 'featuresformCheck" >' + x + '</label></div></td><td id="' + x + '_TD" class="features" oc2endname=' + x + '></div></td></tr>');
			});
		};
	}
	populateFields();
	argsButton();

};

function getNumber() {
	val = Math.floor(Math.random() * 16)
	return val.toString(16)
}

function get_value(entries) {
	var valueToReturn = 0;
	var i = 0;
	while (i < entries) {
		valueToReturn += getNumber();
		i++;
	}
	return valueToReturn
}
function uuid_VerGet() {
	var uuidver = [8, 9, 'a', 'b'];
	return uuidver[Math.floor(Math.random() * uuidver.length)];
}

function getRandomNumber() {
	return get_value(7) + '-' + get_value(3) + '-4' + get_value(2) + '-' + uuid_VerGet() + '' + get_value(2) + '-' + get_value(11)
}

$("#executeNowId").on('click', (function () {
	var oc2Server = $('#oc2ServerId').val();
	var oc2ServerAPIKeyId = $('#oc2ServerKeyId').val();
	var oc2ServerAPI = {};
	oc2ServerAPI['Authorization'] = "Basic " + $('#oc2ServerKeyId').val();
	xhttp.open("POST", oc2Server, true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.setRequestHeader('Accept', 'application/json');
	xhttp.setRequestHeader('Authorization', 'Basic ' + oc2ServerAPIKeyId);

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
return false;
}));
$("#resetSelectionsId").on('click', (function () {
	$('#actuator_id').prop("checked", false);
	$('#asset_id').prop("checked", false);
	$('#actionButtonId').text('action');
	$('#targetButtonId').text('target');
	$('#target_specifierButtonId').text('target_specifier');
	$('#targetValueButtonId').text('select value');
	$('#actuatorButtonId').text('actuator');
	$('#actuatorValueButtonId').text('select value');
	$('#commandSampleContentPre').text('{}');
	$('.actuatorUpdateRow').remove();
	$('.newargsRow').remove();
	openc2command = {
		"action": "",
		"target": {},
		"actuator": {},
		"args": {},
		"command_id": ""
	};
	$('.targetUpdateRow').remove();
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
	return false;
}));

function sampleCodeGenerate(jsonPrettified) {
	var oc2Server = $('#oc2ServerId').val();
	var oc2ServerAPIKeyId = $('#oc2ServerKeyId').val();
	var curlCode = "curl -X POST " + oc2Server + " \\<br>\
-H 'Content-Type: application/json' \\<br>\
-H 'Accept: application/json' \\<br>\
-H 'Authorization: " + "Basic " + oc2ServerAPIKeyId + "' \\<br>\
-d '"
	var curlCodePretty = JSON.stringify(jsonPrettified, null, 2);
	var curlclosing = "'\n";
	$('#curlCodeText').html("".concat(curlCode, jsonPrettified, curlclosing));
	var nodeJsCode = "var request = require('request');\n\
var options = { method: 'POST',\n\
url: '" + oc2Server + "',\n\
headers: \
{ 'Authorization': 'Basic " + oc2ServerAPIKeyId + "',\n\
'Content-Type': 'application/json', 'Accept': 'application/json' },\n\
body: \n"
	var nodeJSclosing = ",\njson: true };\n\
request(options, function (error, response, body) {\n\
if (error) throw new Error(error);\n\
console.log(body);\n\
});"
	$('#nodejsCodeText').text("".concat(nodeJsCode, jsonPrettified, nodeJSclosing));
	var pythonCode = 'import requests\ \nurl = "' + oc2Server + '" \npayload = \''
	var headers = {};
	headers['Content-Type'] = "application/json";
	headers['Accept'] = "application/json";
	headers['Authorization'] = "Basic " + oc2ServerAPIKeyId;
	var headersString = 'headers = ' + JSON.stringify(headers);
	var pythonEnd = 'response = requests.request("POST", url, data=payload, headers=headers, verify=False)';
	var payload = JSON.stringify(openc2command, null, 2);
	var jsonPrettified = jsonPrettified.replace(/\n/g, "\\\<br>");
	$('#pythonCodeText').html("".concat(pythonCode, jsonPrettified, '\'\n', headersString, '\n', pythonEnd, '\n', 'print(response.text)'));
	$('#viewSampleCommandId').removeClass('collapsed');
	$('#viewSampleCommandId').prop('aria-expanded', "true");
	$('#collapse-1').addClass('show');
	$('#sampleCodeDownloadId').removeClass('collapsed');
	$('#sampleCodeDownloadId').prop('aria-expanded', "true");
	$('#collapse-2').addClass('show');
}

$("#generateCodeId").on('click', (function () {
	openc2command['command_id'] = getRandomNumber();
	var jsonPrettified = JSON.stringify(openc2command, null, 2);
	$('#commandSampleContentPre').text(jsonPrettified);
	sampleCodeGenerate(jsonPrettified);
	readOut();
}));

function actionFunction(selectedValue) {
	$('#actionButtonId').text(selectedValue);
	openc2command['action'] = selectedValue;
}

function targetFunction(selectedValue) {
	definitions = openc2CommandSchema.definitions;
	$('#targetButtonId').text(selectedValue);
	openc2command['target'] = {};

	if (selectedValue === 'command') {
		selectedValue = 'command_id';
	} else if (selectedValue === 'slpf:rule_number') {
		selectedValue = 'slpf_rule_id';
	}
	
	if (definitions[selectedValue].type == 'string') {
		openc2command['target'][selectedValue] = "";
	} else if (definitions[selectedValue].type == 'object') {
		openc2command['target'][selectedValue] = {};
	} else if (definitions[selectedValue].type == 'array') {
		openc2command['target'][selectedValue] = [];
	}
	return false;
}

function actuatorFunction(selectedValue) {
	$('#actuatorButtonId').text(selectedValue);
	definitions = openc2CommandSchema.definitions;
	openc2command.actuator = JSON.parse('{ "' + selectedValue + '": {}}');
	$('.actuatorUpdateRow').remove();
	$('.actuatorRow').after('<tr class="actuatorUpdateRow"><td>with a specific actuator of </td><td><div> <div id="actuatorOptionButtonId">' + selectedValue.toUpperCase() + ' Options</div>');
	$.each(definitions.slpf_actuator.properties, function (i, v) {
		$('#actuatorOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + 'actuator_' + i + '" oc2name="actuator" oc2cmdname="' + $('#actuatorButtonId')[0].innerText + '" oc2endname="' + i + '" onclick="dynamicInputCheck(this)"/><label for="' + i + 'formCheck" >' + i + '</label></div></td><td id="' + 'actuator_' + i + '_TD"><input class="inputString input-disabled" oc2name="actuator" oc2cmdname="' + selectedValue + '" oc2checkbox="' + i + '" onchange="updateInputValues(this)" id="' + 'actuator_' + i + '_inputString" oc2endname="' + i + '" type="text" minlength="1" tabindex="-1" value=""/></td></tr>');
	});
}

// Triggered when any checkbox is clicked.
function dynamicInputCheck(test) {
	var getCurrentValue = $('#actuatorButtonId')[0].innerText;
	var targetName = test.getAttribute('oc2name');
	var targetOc2name = test.getAttribute('oc2cmdname');
	var targetOc2EndName = test.getAttribute('oc2endname');
	if (test.checked == true) {
		if (targetOc2EndName != 'any') {
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeClass('input-disabled');
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').attr('readonly', false);
		}
		if (targetName == 'target' && targetOc2EndName == 'hashes') {
			openc2command[targetName][targetOc2name][targetOc2EndName] = {};
			$('.hashTypes').removeClass('input-disabled');
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
		if (targetOc2name != 'features' && targetOc2name != 'actuator' && targetOc2name != 'slpf' && targetOc2name != 'args') {
			if ($('#' + targetName + '_' + targetOc2EndName + '_inputString')[0].type == 'number') {
				openc2command[targetName][targetOc2name][targetOc2EndName] = 0;
			} else {
				openc2command[targetName][targetOc2name][targetOc2EndName] = '';
			}
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'target' && targetOc2name == 'features') {
			if (Object.keys(openc2command.target).includes('features')) {
				openc2command[targetName][targetOc2name].push(targetOc2EndName);
			} else {
				openc2command[targetName] = { "features": [] };
				openc2command[targetName][targetOc2name].push(targetOc2EndName);
			}
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'actuator') {
			openc2command[targetName][getCurrentValue][targetOc2EndName] = $('#' + 'actuator_' + targetOc2EndName + '_inputString')[0].innerText;
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
		if (targetOc2name == 'args') {
			if ($('#' + targetName + '_' + targetOc2EndName + '_inputString')[0].type == 'number') {
				openc2command[targetName][targetOc2EndName] = 0;
			} else {
				openc2command[targetName][targetOc2EndName] = '';
			}
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
	}
	if (test.checked == false) {
		$('#' + targetName + '_' + targetOc2EndName + '_inputString').addClass('input-disabled');
		if (targetOc2EndName == 'hashes') {
			$(test)["0"].parentNode.parentNode.parentNode.children[1].children["0"].children["0"].innerHTML = 'hashes';
			$(test)["0"].parentNode.parentNode.parentNode.children[2].children["0"].value = '';
			$('.newHashTypes').remove();
			$('.hashTypes').addClass('input-disabled');
		}
		$('#' + targetName + '_' + targetOc2EndName + '_inputString').attr('readonly', true);
		$('#' + targetName + '_' + targetOc2EndName + '_inputString').attr('tabindex', '-1');
		if (targetOc2EndName == 'actuator_id') {
			delete openc2command.actuator[getCurrentValue]['actuator_id'];
		}
		if (targetOc2EndName == 'asset_id') {
			delete openc2command.actuator[getCurrentValue]['asset_id'];
		}
		if (targetName == 'target') {
			delete openc2command[targetName][targetOc2name][targetOc2EndName];
			$('#' + targetName + '_' + targetOc2name.targetOc2EndName).addClass('input-disabled');
		}
		if (targetOc2name == 'features') {
			var ValueIndex = openc2command[targetName][targetOc2name].indexOf(targetOc2EndName);
			openc2command[targetName][targetOc2name].splice(ValueIndex, 1);
			$('#' + targetName + '_' + targetOc2name.targetOc2EndName).addClass('input-disabled');
		}
		if (targetName == 'actuator') {
			delete openc2command[targetName][getCurrentValue][targetOc2EndName];
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'args') {
			delete openc2command[targetName][targetOc2EndName];
			$('#' + targetName + '_' + targetOc2EndName + '_inputString').removeAttr('tabindex');
		}
	}
}

function updateValues(test) {
	checkBrowser();
	var chosenAlgorithm = $(test)[0].text;
	var targetName = test.getAttribute('oc2name');
	var targetOc2name = test.getAttribute('oc2cmdname');
	var targetOc2EndName = test.getAttribute('oc2endname');
	if (targetName == 'target' && targetOc2EndName == 'hashes') {
		openc2command[targetName][targetOc2name][targetOc2EndName] = {};
		openc2command[targetName][targetOc2name][targetOc2EndName][chosenAlgorithm] = $('#' + targetName + '_' + targetOc2EndName + '_inputString')["0"].parentNode.parentNode.nextElementSibling.childNodes["0"].value;
		$('#' + targetName + '_' + targetOc2EndName + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'target' && targetOc2EndName == 'features') {
		openc2command[targetName][targetOc2name][targetOc2EndName][chosenAlgorithm] = $('#' + targetName + '_' + targetOc2EndName + '_inputString')[0].parentNode.parentNode.nextElementSibling.childNodes["0"].value;
		$('#' + targetName + '_' + targetOc2EndName + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'actuator') {
		var getCurrentValue = $('#actuatorButtonId')[0].innerText;
		var oc2checkbox = targetOc2EndName;
		openc2command['actuator'][getCurrentValue][oc2checkbox] = $(test)[0].value;
	}

}

function asteriskCheck(w) {
	if (w != '*') {
		return w;
	} else {
		return 'any';
	}
}
function inputTypeCheck(typeValue) {
	if ('$ref' in typeValue) {
		typeValue = typeValue['$ref'].split('/')[2];
		typeValue = openc2CommandSchema.definitions[typeValue];
	}
	if (typeValue.type == 'integer') {
		return 'number';
	} else {
		return 'text'
	}
}

function updateInputValues(inObject) {
	definitions = openc2CommandSchema.definitions;
	var objAttr = $(inObject)["0"].attributes;
	if (objAttr['oc2endname'].value == 'hashes') {
		newInnerText = $(inObject)["0"].parentNode.parentNode.children[1].innerText.replace(/[\n\t]/g, "");
		openc2command['target'][objAttr['oc2cmdname'].value]['hashes'][newInnerText] = $(inObject)["0"].value;
	} else if (objAttr['oc2cmdname'].value == "features") {
		var splitProperties = $(inObject)["0"].value.split(",");
		openc2command[objAttr['oc2name'].value][objAttr['oc2endname'].value] = splitProperties;
	} else if (objAttr['oc2name'].value == "target") {
		if (definitions[objAttr['oc2cmdname'].value].type == 'string') {
			openc2command[objAttr['oc2name'].value][objAttr['oc2cmdname'].value] = $(inObject)[0].value;
		}
		if (definitions[objAttr['oc2cmdname'].value].type == 'object' && objAttr['oc2cmdname'].value != 'args') {
			if ($(inObject)["0"].id == 'size_inputString') {
				openc2command[objAttr['oc2name'].value][objAttr['oc2cmdname'].value][objAttr['oc2endname'].value] = Number($(inObject)[0].value);
			} else if ($('#' + objAttr['oc2name'].value + '_' + objAttr['oc2endname'].value + '_inputString')[0].type == 'number') {
				openc2command[objAttr['oc2name'].value][objAttr['oc2cmdname'].value][objAttr['oc2endname'].value] = Number($(inObject)[0].value);
			}
			else {
				openc2command[objAttr['oc2name'].value][objAttr['oc2cmdname'].value][objAttr['oc2endname'].value] = $(inObject)[0].value;
			}
		}
	}
	if (objAttr['oc2name'].value == "actuator") {
		openc2command[objAttr['oc2name'].value][objAttr['oc2cmdname'].value][objAttr['oc2endname'].value] = $(inObject)[0].value;
	}
	if (objAttr['oc2name'].value == "args") {
		if ($('#' + 'args_' + objAttr['oc2endname'].value + '_inputString')[0].type == 'number') {
			openc2command[objAttr['oc2name'].value][objAttr['oc2endname'].value] = Number($(inObject)[0].value);
		} else {
			openc2command[objAttr['oc2name'].value][objAttr['oc2endname'].value] = $(inObject)[0].value;
		}
	}
	if (objAttr['oc2endname'].value == "properties") {
		openc2command[objAttr['oc2name'].value][objAttr['oc2endname'].value] = [];
		openc2command[objAttr['oc2name'].value][objAttr['oc2endname'].value].push($(inObject)[0].value);
	}
}

function readOut() {
	var sampleCleanUp = JSON.parse($('#commandSampleContentPre')[0].innerText)
	var lout1 = JSON.stringify(sampleCleanUp);
	window.history.pushState({}, 'OpenC2 Command ' + openc2command['command_id'], '?command=' + lout1);
	document.title = 'OpenC2 Command ' + openc2command['command_id'];
}

function readIn() {
	//add if exists for optional values e.g args, actuator
	var decodedURL = decodeURIComponent(window.location.search);
	if (decodedURL.length > 0) {
		var decodedString = decodedURL.replace(/\?command=/, "");
		var URLJSON = JSON.parse(decodedString);
		var URL = JSON.stringify(URLJSON);
		var URLParse = JSON.parse(URL);
		var actionIn = URLParse['action']
		$('#' + actionIn + 'SelectionId').click();
		if ('target' in URLParse) {
			var targetIn = URLParse['target'];
			var targetStr = Object.keys(targetIn)[0];
			$('#' + targetStr + 'SelectionId').click();
			if (typeof (URLParse['target'][Object.keys(URLParse['target'])]) == 'string') {
				$('#' + 'target_' + targetStr + '_inputString')[0].value = URLParse['target'][targetStr];
				openc2command['target'][targetStr] = URLParse['target'][targetStr];
			}
			if (typeof (URLParse['target'][Object.keys(URLParse['target'])]) == 'object') {
				$.each(targetIn, function (u, g) {

					$.each(g, function (t, s) {

						if (t == "hashes") {
							$('#' + 'target_' + t).click();
							$('#' + 'target_hashes_inputString')[0].innerText = Object.keys(s)[0];
							$('#' + 'target_hashtype')[0].value = s[Object.keys(s)[0]];
							hashType = Object.keys(s)[0];
							openc2command['target'][targetStr] = {};
							openc2command['target'][targetStr]['hashes'] = {};
							openc2command['target'][targetStr]['hashes'][Object.keys(s)[0]] = {};
							openc2command['target'][targetStr]['hashes'][Object.keys(s)[0]] = s[Object.keys(s)[0]];
						}
						else if (targetStr == 'features') {
							$('#featuresSelectionId').click();
							$.each(URLParse['target']['features'], function (f, a) {
								$('#' + a).click();
							}
							)
						}
						else if (targetStr == 'properties') {
							$('#propertiesSelectionId').click();
							$('#target_properties_inputString')[0].value =
								$('#' + 'target_properties_inputString')[0].value = URLParse['target']['properties'][0];
							openc2command['target']['properties'].push(URLParse['target']['properties'][0]);
						}
						else {
							$('#' + 'target_' + t).click();
							$('#' + 'target_' + t + '_inputString')[0].value = s;
							openc2command['target'][targetStr][t] = s;
						}

					});
				});
			}



			if ('args' in URLParse) {
				argsIn = URLParse['args']
				if (Object.keys(argsIn).length > 0) {
					openc2command['args'] = argsIn;
					argsStr = Object.keys(argsIn)[0];
					$('#argsButtonId').click();
					if (Object.keys(argsIn).length > 0) {
						$.each(argsIn, function (a, s) {
							$('#' + 'args_' + a).click();
							$('#' + 'args_' + a + '_inputString')[0].value = s;
							openc2command['args'][a] = s;
						});
					}
				}
			}

			if ('actuator' in URLParse) {
				actuatorIn = URLParse['actuator']
				if (Object.keys(actuatorIn).length > 0) {
					openc2command['actuator'] = actuatorIn;
					actuatorStr = Object.keys(actuatorIn)[0];
					$('#' + actuatorStr + 'SelectionId').click();
					if (Object.keys(actuatorIn[actuatorStr]).length > 0) {
						$.each(actuatorIn[actuatorStr], function (a, s) {
							$('#' + 'actuator_' + a).click();
							$('#' + 'actuator_' + a + '_inputString')[0].value = s;
							openc2command['actuator'][actuatorStr][a] = s;
						});
					}
				}
			}

		};
	}
}