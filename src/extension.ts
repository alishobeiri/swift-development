import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

function cleanJSON(jsonString: string): string {
    return jsonString.replace(/^\uFEFF/, '');
}

function deepMerge(target: any, source: any) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "swift-development" is now active!');

    // Register command for generating settings.json
    vscode.commands.registerCommand('swift-development.generateSettings', async () => {
        const settingsPath = path.join(vscode.workspace.rootPath || '', '.vscode', 'settings.json');

        const newSettings = {
            "triggerTaskOnSave.runonsave": {
                "sweetpad: build": ["**/*.swift"]
            },
            "triggerTaskOnSave.on": true,
            "triggerTaskOnSave.showNotifications": false,
            "triggerTaskOnSave.restart": true,
            "triggerTaskOnSave.delay": 1000,
            "triggerTaskOnSave.resultIndicatorResetTimeout": 5,
            "workbench.colorCustomizations": {},
            "[swift]": {
                "editor.defaultFormatter": "sweetpad.sweetpad",
                "editor.formatOnSave": true,
                "editor.tabSize": 4,
                "editor.insertSpaces": true,
                "sweetpad.format.args": [
                    "--quiet",
                    "--line-length", "100",
                    "--indentation", "spaces", "4",
                    "${file}"
                ]
            }
        };

        try {
            let currentSettings = {};

            if (fs.existsSync(settingsPath)) {
                const settingsRaw = fs.readFileSync(settingsPath, 'utf-8');
                try {
                    currentSettings = JSON.parse(cleanJSON(settingsRaw));
                } catch (jsonError) {
                    vscode.window.showErrorMessage(`Error parsing existing settings.json: ${(jsonError as any).message}`);
                    return;
                }
            }

            const updatedSettings = deepMerge(currentSettings, newSettings);

            const vscodeDir = path.dirname(settingsPath);
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir);
            }

            fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 4));
            vscode.window.showInformationMessage(`settings.json has been updated successfully.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error updating settings.json: ${(error as any).message}`);
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('swift-development.generateLaunch', async () => {
        const settingsPath = path.join(vscode.workspace.rootPath || '', '.vscode', 'launch.json');

        const newLaunchConfig = {
            "version": "0.2.0",
            "configurations": [
                {
                    "type": "sweetpad-lldb",
                    "request": "launch",
                    "name": "Attach to running app (SweetPad)",
                    "preLaunchTask": "sweetpad: launch"
                }
            ]
        };

        try {
            let currentLaunchConfig = { version: "0.2.0", configurations: [] };

            if (fs.existsSync(settingsPath)) {
                const launchConfigRaw = fs.readFileSync(settingsPath, 'utf-8');
                try {
                    currentLaunchConfig = JSON.parse(cleanJSON(launchConfigRaw));
                } catch (jsonError) {
                    vscode.window.showErrorMessage(`Error parsing existing launch.json: ${(jsonError as any).message}`);
                    return;
                }
            }

            const updatedConfigurations = newLaunchConfig.configurations.filter(
                (newConfig) => !currentLaunchConfig.configurations.some((currentConfig) => (currentConfig as any).name === newConfig.name)
            ).concat(currentLaunchConfig.configurations);

            const updatedLaunchConfig = {
                version: currentLaunchConfig.version || newLaunchConfig.version,
                configurations: updatedConfigurations
            };

            const vscodeDir = path.dirname(settingsPath);
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir);
            }

            fs.writeFileSync(settingsPath, JSON.stringify(updatedLaunchConfig, null, 4));
            vscode.window.showInformationMessage(`launch.json has been updated successfully.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error updating launch.json: ${(error as any).message}`);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('swift-development.generateTasks', async () => {
        const settingsPath = path.join(vscode.workspace.rootPath || '', '.vscode', 'tasks.json');

        const newTaskConfig = {
            "version": "2.0.0",
            "tasks": [
                {
                    "type": "sweetpad",
                    "action": "build",
                    "problemMatcher": [
                        "$sweetpad-watch",
                        "$sweetpad-xcodebuild-default",
                        "$sweetpad-xcbeautify-errors",
                        "$sweetpad-xcbeautify-warnings"
                    ],
                    "label": "sweetpad: build",
                    "detail": "Build the app"
                },
                {
                    "type": "sweetpad",
                    "action": "launch",
                    "problemMatcher": [
                        "$sweetpad-watch",
                        "$sweetpad-xcodebuild-default",
                        "$sweetpad-xcbeautify-errors",
                        "$sweetpad-xcbeautify-warnings"
                    ],
                    "label": "sweetpad: launch",
                    "detail": "Build and Launch the app"
                },
                {
                    "type": "sweetpad",
                    "action": "clean",
                    "problemMatcher": [
                        "$sweetpad-watch",
                        "$sweetpad-xcodebuild-default",
                        "$sweetpad-xcbeautify-errors",
                        "$sweetpad-xcbeautify-warnings"
                    ],
                    "label": "sweetpad: clean",
                    "detail": "Clean the app"
                }
            ]
        };

        try {
            let currentTaskConfig = { version: "2.0.0", tasks: [] };

            if (fs.existsSync(settingsPath)) {
                const taskConfigRaw = fs.readFileSync(settingsPath, 'utf-8');
                try {
                    currentTaskConfig = JSON.parse(cleanJSON(taskConfigRaw));
                } catch (jsonError) {
                    vscode.window.showErrorMessage(`Error parsing existing tasks.json: ${(jsonError as any).message}`);
                    return;
                }
            }

            const updatedTasks = newTaskConfig.tasks.filter(
                (newTask) => !currentTaskConfig.tasks.some((currentTask) => (currentTask as any).label === newTask.label)
            ).concat(currentTaskConfig.tasks);

            const updatedTaskConfig = {
                version: currentTaskConfig.version || newTaskConfig.version,
                tasks: updatedTasks
            };

            const vscodeDir = path.dirname(settingsPath);
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir);
            }

            fs.writeFileSync(settingsPath, JSON.stringify(updatedTaskConfig, null, 4));
            vscode.window.showInformationMessage(`tasks.json has been updated successfully.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error updating tasks.json: ${(error as any).message}`);
        }
    }));

    // Register command to run sweetpad: launch task
    context.subscriptions.push(vscode.commands.registerCommand('swift-development.runSweetpadLaunch', async () => {
        try {
            const task = (await vscode.tasks.fetchTasks()).find(t => t.name === 'sweetpad: launch');
            if (task) {
                vscode.tasks.executeTask(task);
                vscode.window.showInformationMessage('Running sweetpad: launch task.');
            } else {
                vscode.window.showWarningMessage('Could not find task labeled "sweetpad: launch". Please ensure tasks.json is properly configured.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error running sweetpad: launch task: ${(error as any).message}`);
        }
    }));
}
