import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../utils/config-manager';

const configManager = ConfigManager.getInstance();

export const configCommand = new Command('config')
  .description('Manage provider configurations')
  .addCommand(
    new Command('set')
      .description('Set configuration values')
      .argument('[key]', 'Configuration key (e.g., aws.access_key_id)')
      .argument('[value]', 'Configuration value')
      .action(async (key, value) => {
        if (key && value) {
          configManager.set(key, value);
          console.log(`✓ Set ${key} = ${value}`);
        } else {
          await interactiveSetup();
        }
      })
  )
  .addCommand(
    new Command('get')
      .description('Get configuration values')
      .argument('[key]', 'Configuration key to retrieve')
      .action((key) => {
        if (key) {
          const value = configManager.get(key);
          if (value !== undefined) {
            console.log(`${key} = ${value}`);
          } else {
            console.log(`${key} is not set`);
          }
        } else {
          const allConfig = configManager.getAll();
          console.log(JSON.stringify(allConfig, null, 2));
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all configuration')
      .action(() => {
        const config = configManager.getAll();
        console.log('\n📋 Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
      })
  )
  .addCommand(
    new Command('setup')
      .description('Interactive setup for provider credentials')
      .option('-p, --provider <provider>', 'Specific provider to setup (aws, vercel, gcp)')
      .action(async (options) => {
        if (options.provider) {
          await setupProvider(options.provider);
        } else {
          await interactiveSetup();
        }
      })
  )
  .addCommand(
    new Command('status')
      .description('Show configuration and credential status')
      .action(() => {
        showConfigStatus();
      })
  );

async function interactiveSetup(): Promise<void> {
  console.log('\n🔧 Terraform CLI Configuration Setup\n');
  
  const { providers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'providers',
      message: 'Which providers would you like to configure?',
      choices: [
        { name: 'AWS', value: 'aws' },
        { name: 'Vercel', value: 'vercel' },
        { name: 'Google Cloud Platform', value: 'gcp' }
      ]
    }
  ]);

  for (const provider of providers) {
    await setupProvider(provider);
  }

  console.log('\n✅ Configuration setup complete!');
}

async function setupProvider(provider: string): Promise<void> {
  console.log(`\n🔑 Setting up ${provider.toUpperCase()}`);
  
  const detected = configManager.detectExistingCredentials();
  if (detected[provider]) {
    console.log(`✓ Existing ${provider} credentials detected`);
    const { useExisting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useExisting',
        message: `Use existing ${provider} credentials?`,
        default: true
      }
    ]);
    
    if (useExisting) {
      console.log(`Using existing ${provider} credentials`);
      return;
    }
  }

  switch (provider) {
    case 'aws':
      await setupAws();
      break;
    case 'vercel':
      await setupVercel();
      break;
    case 'gcp':
      await setupGcp();
      break;
    default:
      console.log(`Unknown provider: ${provider}`);
  }
}

async function setupAws(): Promise<void> {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to configure AWS?',
      choices: [
        { name: 'Access Keys (Access Key ID + Secret)', value: 'keys' },
        { name: 'AWS Profile (use existing profile)', value: 'profile' },
        { name: 'Skip (use environment variables)', value: 'skip' }
      ]
    }
  ]);

  if (method === 'keys') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'accessKeyId',
        message: 'AWS Access Key ID:',
        validate: (input) => input.trim() !== '' || 'Access Key ID is required'
      },
      {
        type: 'password',
        name: 'secretAccessKey',
        message: 'AWS Secret Access Key:',
        validate: (input) => input.trim() !== '' || 'Secret Access Key is required'
      },
      {
        type: 'input',
        name: 'region',
        message: 'Default AWS Region:',
        default: 'us-east-1'
      }
    ]);

    configManager.set('aws.access_key_id', answers.accessKeyId);
    configManager.set('aws.secret_access_key', answers.secretAccessKey);
    configManager.set('aws.region', answers.region);
    
  } else if (method === 'profile') {
    const { profile } = await inquirer.prompt([
      {
        type: 'input',
        name: 'profile',
        message: 'AWS Profile name:',
        default: 'default'
      }
    ]);
    
    configManager.set('aws.profile', profile);
  }

  console.log('✓ AWS configuration saved');
}

async function setupVercel(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiToken',
      message: 'Vercel API Token (get from https://vercel.com/account/tokens):',
      validate: (input) => input.trim() !== '' || 'API Token is required'
    },
    {
      type: 'input',
      name: 'teamId',
      message: 'Vercel Team ID (optional):'
    }
  ]);

  configManager.set('vercel.api_token', answers.apiToken);
  if (answers.teamId) {
    configManager.set('vercel.team_id', answers.teamId);
  }

  console.log('✓ Vercel configuration saved');
}

async function setupGcp(): Promise<void> {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to configure GCP?',
      choices: [
        { name: 'Service Account Key File', value: 'service_account' },
        { name: 'Project ID only (use gcloud CLI)', value: 'project_only' },
        { name: 'Skip (use environment variables)', value: 'skip' }
      ]
    }
  ]);

  if (method === 'service_account') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectId',
        message: 'GCP Project ID:',
        validate: (input) => input.trim() !== '' || 'Project ID is required'
      },
      {
        type: 'input',
        name: 'serviceAccountPath',
        message: 'Path to Service Account Key file:',
        validate: (input) => input.trim() !== '' || 'Service Account path is required'
      },
      {
        type: 'input',
        name: 'region',
        message: 'Default GCP Region:',
        default: 'us-central1'
      }
    ]);

    configManager.set('gcp.project_id', answers.projectId);
    configManager.set('gcp.service_account_path', answers.serviceAccountPath);
    configManager.set('gcp.region', answers.region);
    
  } else if (method === 'project_only') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectId',
        message: 'GCP Project ID:',
        validate: (input) => input.trim() !== '' || 'Project ID is required'
      },
      {
        type: 'input',
        name: 'region',
        message: 'Default GCP Region:',
        default: 'us-central1'
      }
    ]);

    configManager.set('gcp.project_id', answers.projectId);
    configManager.set('gcp.region', answers.region);
  }

  console.log('✓ GCP configuration saved');
}

function showConfigStatus(): void {
  console.log('\n📊 Configuration Status\n');
  
  const config = configManager.getAll();
  const detected = configManager.detectExistingCredentials();
  
  const providers = ['aws', 'vercel', 'gcp'];
  
  for (const provider of providers) {
    const hasConfig = configManager.hasProvider(provider);
    const hasDetected = detected[provider];
    
    let status = '❌ Not configured';
    if (hasConfig) {
      status = '✅ Configured in .tfrc';
    } else if (hasDetected) {
      status = '🔍 Detected in environment';
    }
    
    console.log(`${provider.toUpperCase().padEnd(7)} ${status}`);
    
    if (hasConfig && config[provider as keyof typeof config]) {
      const providerConfig = config[provider as keyof typeof config];
      if (providerConfig && typeof providerConfig === 'object') {
        Object.keys(providerConfig).forEach(key => {
          const value = (providerConfig as any)[key];
          const displayValue = key.includes('secret') || key.includes('token') || key.includes('key') 
            ? '***' 
            : value;
          console.log(`         ${key}: ${displayValue}`);
        });
      }
    }
    console.log();
  }
}