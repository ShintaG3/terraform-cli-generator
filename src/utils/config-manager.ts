import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  aws?: {
    access_key_id?: string;
    secret_access_key?: string;
    region?: string;
    profile?: string;
  };
  vercel?: {
    api_token?: string;
    team_id?: string;
  };
  gcp?: {
    project_id?: string;
    service_account_path?: string;
    region?: string;
  };
  defaults?: {
    region?: string;
    environment?: string;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configPath: string;
  private config: Config;

  private constructor() {
    this.configPath = path.join(os.homedir(), '.tfrc');
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.warn('Warning: Could not load config file, using defaults');
    }
    return {};
  }

  public saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config file: ${error}`);
    }
  }

  public get(key: string): any {
    const keys = key.split('.');
    let value: any = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  public set(key: string, value: any): void {
    const keys = key.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveConfig();
  }

  public getAll(): Config {
    return { ...this.config };
  }

  public hasProvider(provider: string): boolean {
    return provider in this.config && Object.keys(this.config[provider as keyof Config] || {}).length > 0;
  }

  public getEnvironmentConfig(provider: string): Record<string, string> {
    const envVars: Record<string, string> = {};
    
    switch (provider) {
      case 'aws':
        if (this.get('aws.access_key_id')) {
          envVars.AWS_ACCESS_KEY_ID = this.get('aws.access_key_id');
        }
        if (this.get('aws.secret_access_key')) {
          envVars.AWS_SECRET_ACCESS_KEY = this.get('aws.secret_access_key');
        }
        if (this.get('aws.region')) {
          envVars.AWS_DEFAULT_REGION = this.get('aws.region');
        }
        if (this.get('aws.profile')) {
          envVars.AWS_PROFILE = this.get('aws.profile');
        }
        break;
        
      case 'vercel':
        if (this.get('vercel.api_token')) {
          envVars.VERCEL_API_TOKEN = this.get('vercel.api_token');
        }
        if (this.get('vercel.team_id')) {
          envVars.VERCEL_TEAM_ID = this.get('vercel.team_id');
        }
        break;
        
      case 'gcp':
        if (this.get('gcp.project_id')) {
          envVars.GOOGLE_CLOUD_PROJECT = this.get('gcp.project_id');
        }
        if (this.get('gcp.service_account_path')) {
          envVars.GOOGLE_APPLICATION_CREDENTIALS = this.get('gcp.service_account_path');
        }
        break;
    }
    
    return envVars;
  }

  public detectExistingCredentials(): Record<string, boolean> {
    const detected: Record<string, boolean> = {};
    
    // Check AWS
    detected.aws = !!(
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_PROFILE ||
      fs.existsSync(path.join(os.homedir(), '.aws', 'credentials'))
    );
    
    // Check Vercel
    detected.vercel = !!(
      process.env.VERCEL_API_TOKEN ||
      fs.existsSync(path.join(os.homedir(), '.vercel'))
    );
    
    // Check GCP
    detected.gcp = !!(
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      fs.existsSync(path.join(os.homedir(), '.config', 'gcloud'))
    );
    
    return detected;
  }
}