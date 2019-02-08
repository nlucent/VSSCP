
const vscode = require('vscode');
var node_ssh = require('node-ssh');

var ssh = new node_ssh();
const config = vscode.workspace.getConfiguration('vsscp', null, vscode.Global);

if (config.get('sshKey')) {
	var sshKey = config.get('sshKey').toString();
}

if (config.get('preferredHost').toString()) {
	vscode.window.setStatusBarMessage("VSSCP: " + config.get('preferredHost').toString());
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	var hostInfo, curFile, curPath, pathMaps;
	let copyOne = vscode.commands.registerCommand('vsscp.copyOne', function () {

		if (config.get('preferredHost').toString()) {
			hostInfo = config.get('preferredHost').toString().split('@');
			vscode.window.setStatusBarMessage("VSSCP: " + hostInfo);
		} else {
			vscode.window.showInformationMessage("Preferred host not set");
		}

		curFile = vscode.window.activeTextEditor.document.fileName;

		if (curFile) {
			pathMaps = config.get('pathMap');
			if (pathMaps) {
				for (var key in pathMaps) {
					if (curFile.startsWith(key) === true) {
						copyFile(hostInfo[0], sshKey, curFile, hostInfo[1], pathMaps[key] + curFile.slice(key.length));
					}
				}
			}
		}

	});

	let setHost = vscode.commands.registerCommand('vsscp.setHost', function () {
		var availHosts = [];
		availHosts = config.get('hosts');
		vscode.window.showQuickPick(availHosts).then(selection => {
			if (!selection) {
				return;
			}
			config.update("preferredHost", selection.toString(), vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage("Set " + selection.toString() + " to preferred");
			vscode.window.setStatusBarMessage("VSSCP: " + selection.toString());
		});

	});

	let addHost = vscode.commands.registerCommand('vsscp.addHost', function () {
		vscode.window.showInputBox({ prompt: "Enter new scp host (ex. user@host)" }).then(input => {
			if (!input) {
				return;
			}

			var hosts = [];
			hosts = config.get('hosts');
			hosts.push(input.toString());
			config.update('hosts', hosts, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage("Added " + input.toString() + " to scp host list");
		});
	});

	let copyAll = vscode.commands.registerCommand('vsscp.copyAll', function () {

	});

	context.subscriptions.push(copyAll);
	context.subscriptions.push(copyOne);
	context.subscriptions.push(setHost);
	context.subscriptions.push(addHost);
}
exports.activate = activate;

function deactivate() { }

function copyFile(userName, keyPath, srcFile, destHost, destPath) {
	var path = require("path");

	ssh.connect({
		host: destHost,
		username: userName,
		privateKey: keyPath
	})

		.then(function () {
			ssh.putFile(srcFile, destPath);
			vscode.window.showInformationMessage("Copied " + path.basename(srcFile) + " to " + destHost + ":" + destPath);
		})

		.then(undefined, err => {
			// failure
			vscode.window.showInformationMessage("Failed copying " + srcFile);
			console.error(err)
		});
}

module.exports = {
	activate,
	deactivate
}
