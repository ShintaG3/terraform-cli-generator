import { Provider, ProviderOptions } from '../types';
import { TemplateEngine } from '../utils/template-engine';
import { ConfigManager } from '../utils/config-manager';

export class GcpProvider extends Provider {
  private templateEngine: TemplateEngine;
  private configManager: ConfigManager;
  
  constructor() {
    super();
    this.templateEngine = TemplateEngine.getInstance();
    this.configManager = ConfigManager.getInstance();
  }
  
  async generate(resource: string, options: ProviderOptions): Promise<void> {
    const supportedResources = ['storage', 'function', 'compute'];
    
    if (!supportedResources.includes(resource)) {
      throw new Error(`Unsupported GCP resource: ${resource}. Supported: ${supportedResources.join(', ')}`);
    }
    
    if (!options.name) {
      throw new Error('Resource name is required (use -n or --name)');
    }
    
    const configuredRegion = this.configManager.get('gcp.region');
    const configuredProjectId = this.configManager.get('gcp.project_id');
    
    const templateData = {
      name: options.name,
      region: options.region || configuredRegion || 'us-central1',
      runtime: options.runtime || 'nodejs18',
      project_id: configuredProjectId
    };
    
    // Check if GCP is configured
    if (!this.isConfigured()) {
      console.log('\n⚠️  GCP credentials not configured. Run: tf config setup --provider gcp');
      console.log('   Or set environment variables: GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT\n');
    }
    
    const templatePath = this.templateEngine.getTemplatePath('gcp', resource);
    const content = this.templateEngine.render(templatePath, templateData);
    
    this.writeToFile(`gcp-${resource}-${options.name}.tf`, content);
  }
  
  private isConfigured(): boolean {
    const detected = this.configManager.detectExistingCredentials();
    return detected.gcp || this.configManager.hasProvider('gcp');
  }
}