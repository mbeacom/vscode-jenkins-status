'use strict'

import * as vscode from 'vscode';
import fs = require('fs');
import * as jenkins from './jenkins';
import path = require('path');

export class JenkinsIndicator {

    private statusBarItem: vscode.StatusBarItem;

    dispose() {
        this.hideReadOnly();
    }

    public updateJenkinsStatus() {

        return new Promise((resolve, reject) => {
            // Create as needed
            if (!this.statusBarItem) {
                this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            }

            let jjj: jenkins.Jenkins;
            jjj = new jenkins.Jenkins;


            let url: string;
            let settings = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath, '.jenkins')).toString());
            url = settings.url;
            
            // invalid URL
            if (!url) {
                this.statusBarItem.tooltip = 'No URL Defined';
                this.statusBarItem.text = 'Jenkins $(x)';
                this.statusBarItem.show();
                resolve(true);
                return;
            }            
        
            jjj.getStatus(url)
                .then((status) => {

                    let icon: string;

                    switch (status.status) {
                        case jenkins.BuildStatus.Sucess:
                            icon = ' $(check)';
                            this.statusBarItem.tooltip = 
                                'Job Name: ' + status.jobName + '\n' +
                                'URL.....: ' + status.url + '\n' +
                                'Build #.: ' + status.buildNr; 
                            break;

                        case jenkins.BuildStatus.Failed:
                            icon = ' $(x)';
                            if (status.connectionStatus == jenkins.ConnectionStatus.AuthenticationRequired) {
                                this.statusBarItem.tooltip = 
                                    'Job Name: ' + status.jobName + '\n' +
                                    '<<Authenthication Required>>'; 
                            } else {
                                this.statusBarItem.tooltip = 
                                    'Job Name: ' + status.jobName + '\n' +
                                    '<<Invalid Address>>'; 
                            }
                            break;
                    
                        default:
                            icon = ' $(stop)';
                            this.statusBarItem.tooltip = 
                                'Job Name: ' + status.jobName + '\n' +
                                'URL.....: ' + status.url + '\n' +
                                'Build #.: ' + status.buildNr; 
                    }
                        
                    this.statusBarItem.text = 'Jenkins' + icon;
                    this.statusBarItem.show();
                    resolve(status != undefined);
                });
        });
    }

    public hideReadOnly() {
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
    }
}

export class JenkinsIndicatorController {

    private jenkinsIndicator: JenkinsIndicator;
    private disposable: vscode.Disposable;
    private _isControlled: boolean = false;

    constructor(indicator: JenkinsIndicator) {
        let myself = this;
        this.jenkinsIndicator = indicator;
        this.jenkinsIndicator.updateJenkinsStatus();
    }

    dispose() {
        this.disposable.dispose();
    }

    private onEvent() {
        this.jenkinsIndicator.updateJenkinsStatus();
    }

}