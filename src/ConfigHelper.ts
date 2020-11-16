import { getCommandLineArg } from './CommandLine'

import * as Fs from 'fs'
import * as Path from 'path'

let camelCase = require('camelcase')

export default class ConfigHelper {
    private readonly configName: string;
    private readonly levelsUp: number;
    
    private readonly moduleName: string;
    private readonly baseDir: string;

    /** Array of loaded config objects, arranged from the most important to least important */
    private prodConfig: any;
    private devConfig: any;
    
    /** Will try to load */
    constructor(levelsUp: number = 1, configName: string = "config/config") {
        this.configName = configName;
        this.levelsUp = levelsUp;

        this.moduleName = Path.basename(process.cwd());
        this.baseDir = Path.dirname(process.cwd());

        this.loadConfigObjects();
    }

    private loadConfigObjects() {
        let levelsUpLeft = this.levelsUp;
        let currentDir = '';

        while (levelsUpLeft>=0) {
            let object = this.loadConfigObject(currentDir);
            if (object) {
                this.prodConfig = object;
            }

          /*  object = this.loadConfigObject(currentDir, "-dev");
            if (object) {
                this.devConfig = object;
            }
          */

            currentDir += "../"
            levelsUpLeft--;
        }
    }
    
    private readAndCompile(filename: string) {
        let fileContents = Fs.readFileSync(filename, { encoding: "UTF-8" } );
        let Module = require('module');
        var m = new Module();
        m._compile(fileContents, filename);
        return m.exports;
    }

    private loadConfigObject(dirname: string, suffix: string = "") {
        let relativePath = Path.join( dirname, this.moduleName, this.configName + suffix + ".js" )
        let fullPath = Path.join( this.baseDir, relativePath );

        try {
            console.log("Looking for config file {}", fullPath);
            
            if (Fs.existsSync(fullPath)) {
                console.log("Loading config", relativePath);
                
                let configModule = this.readAndCompile(fullPath);

                if (configModule.default) {
                    return configModule.default;
                }
    
                console.error("Could not find default export in the file {}. Make sure it is a well behaved js module and ends with module.exports.default=config statement", relativePath);
            }
        }
        catch (error) {
            console.error("Could not load config object {}, {}", relativePath, error)
        }

        return null;
    }

    isDefined(configPropertyName: string): boolean {
        return this.getConfigValue(configPropertyName) !== undefined;
    }

    getConfigValue(configPropertyName: string, defValue: string): string;
    getConfigValue(configPropertyName: string, defValue: number): number;
    getConfigValue(configPropertyName: string, defValue: boolean): boolean;
    getConfigValue(configPropertyName: string): any | undefined;

    getConfigValue(configPropertyName: string, defValue?: number | string | boolean | undefined): string | number | boolean | undefined {
        let configValue = defValue;
        
        // Checking if the prodConfig defines the value
        if (this.prodConfig) {
            configValue = getPropValue(this.prodConfig, configPropertyName, configValue); 
        }

        // Check if the devConfig overrides the value
       /* if (this.devConfig) {
            configValue = getPropValue(this.devConfig, configPropertyName, configValue);
        }*/

        // Check if the command line overrides the value
        let cmdOverrideName = "--" + camelCase(configPropertyName);
        return getCommandLineArg(cmdOverrideName, configValue as any);
    }

    getConfigValueOrFail(configPropertyName: string, errorMessage?: string): any {
        let result = this.getConfigValue(configPropertyName);

        if (result===undefined) {
            throw(`Config parameter ${configPropertyName} is required. ${errorMessage}`)
        }
        else {
            return result;
        }
    }
}

export function getPropValue(object: any, propName: string | string[], defValue?: any) {
    if (typeof propName === 'string') {
        propName = propName.split("\.");
    }

    return _getPropValue(object, propName, defValue, 0)
}

function _getPropValue(object: any, propName: string[], defValue: any, skip: number): any {
    if (propName.length === skip) {
        return object;
    }

    if (object !== null && propName[skip] in object) {
        return _getPropValue(object[propName[skip]], propName, defValue, skip + 1);
    }
    else {
        return defValue;
    }
}
