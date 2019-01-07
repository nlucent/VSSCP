
const vscode = require('vscode');
var node_ssh = require('node-ssh');

var ssh = new node_ssh();
const config = vscode.workspace.getConfiguration('vsscp',null,vscode.Global);

if (config.get('privateKey')) {
	var sshKey = config.get('privateKey').toString();
}

if (config.get('preferredHost').toString()) {
	vscode.window.setStatusBarMessage("VSSCP: " + config.get('preferredHost').toString());
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	var path = require("path");
	var hostInfo, curFile, curPath, pathMaps;

	let copyOne = vscode.commands.registerCommand('extension.copyOne', function() {

		if (config.get('preferredHost').toString()) {
			hostInfo = config.get('preferredHost').toString().split('@');
			vscode.window.setStatusBarMessage("VSSCP: " + hostInfo);
		} else {
			vscode.window.showInformationMessage("Preferred host not set");
		}

		curFile = vscode.window.activeTextEditor.document.fileName;

		if (curFile) {
			curPath = path.dirname(curFile);
		}

		pathMaps = config.get('pathMap');

		if (pathMaps) {
			if (pathMaps[curPath]) {
				// vscode.window.showInformationMessage("Copied " + path.basename(curFile));
				copyFile(hostInfo[0], sshKey, curFile, hostInfo[1], pathMaps[curPath] + '/' + path.basename(curFile));
			} else {
				vscode.window.showInformationMessage("curPath not in pathMaps");
			}
		}

	});

	let setHost = vscode.commands.registerCommand('extension.setHost', function() {
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

	let addHost = vscode.commands.registerCommand('extension.addHost', function() {
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

	let copyAll = vscode.commands.registerCommand('extension.copyAll', function() {

	});

	context.subscriptions.push(copyAll);
	context.subscriptions.push(copyOne);
	context.subscriptions.push(setHost);
	context.subscriptions.push(addHost);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function copyFile(userName, keyPath, srcFile, destHost, destPath) {
	ssh.connect({
		host: destHost,
		username: userName,
		privateKey: keyPath
	})

		.then(function () {
			ssh.putFile(srcFile, destPath);
		})

		.then(function () {
			// success
			vscode.window.showInformationMessage("Copied " + srcFile + " to " + destHost);
		},
			function (error) {
				// failure
				vscode.window.showInformationMessage("Failed copying " + srcFile);
			}
		);
}

module.exports = {
	activate,
	deactivate
}
