# VSSCP README

SCP (Secure Copy) extension for VS Code supporting multiple remote hosts with file path substitution.

## Features

* Quickly and easily copy current file to multiple remote hosts/environments.
* 1 button command (f1 by default) to copy current file to preferred remote host.
* Add new hosts and set preferred host via the Command Palette
* Automatically substitutes file path for remote location.

## Dependencies

* Requires node-ssh npm module

## Command Palette Additions

This extension contributes the following additions to the Command Palette:

* `SCP current file`
* `SCP all open files*`
* `SCP add host`
* `SCP set preferred host`

## Extension Settings

This extension contributes the following settings:

* `vsscp.hosts`: List of user@host entries to copy remote files
* `vsscp.pathMap`:  List of local:remote path entries for path substitution
* `vsscp.preferredHost`: Current selected/default host to receive files
* `vsscp.privateKey`:  Private SSH key to use to connect to remote systems

## Extension Keybindings
This extension contributes the following key bindings:
* `F1`:  Copy current file to preferred remote host

## Known Issues

* Only tested on Linux
* `SCP all open files not yet implemented`

## Release Notes

None

### 0.1

Initial release
