import { Provider, ProviderOptions } from '../types';
import { TemplateEngine } from '../utils/template-engine';
import { ConfigManager } from '../utils/config-manager';

export class AwsProvider extends Provider {
  private templateEngine: TemplateEngine;
  private configManager: ConfigManager;
  
  constructor() {
    super();
    this.templateEngine = TemplateEngine.getInstance();
    this.configManager = ConfigManager.getInstance();
  }
  
  async generate(resource: string, options: ProviderOptions): Promise<void> {
    const supportedResources = ['lambda', 's3', 'ec2'];
    
    if (!supportedResources.includes(resource)) {
      throw new Error(`Unsupported AWS resource: ${resource}. Supported: ${supportedResources.join(', ')}`);
    }
    
    if (!options.name) {
      throw new Error('Resource name is required (use -n or --name)');
    }
    
    const configuredRegion = this.configManager.get('aws.region');
    const templateData = {
      name: options.name,
      region: options.region || configuredRegion || 'us-east-1',
      runtime: options.runtime || 'nodejs18.x'
    };
    
    // Check if AWS is configured
    if (!this.isConfigured()) {
      console.log('\n⚠️  AWS credentials not configured. Run: tf config setup --provider aws');
      console.log('   Or set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY\n');
    }
    
    const templatePath = this.templateEngine.getTemplatePath('aws', resource);
    const content = this.templateEngine.render(templatePath, templateData);
    
    this.writeToFile(`aws-${resource}-${options.name}.tf`, content);
  }
  
  private isConfigured(): boolean {
    const detected = this.configManager.detectExistingCredentials();
    return detected.aws || this.configManager.hasProvider('aws');
  }
}