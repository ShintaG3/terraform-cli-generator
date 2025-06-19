import { Provider, ProviderOptions } from '../types';
import { TemplateEngine } from '../utils/template-engine';
import { ConfigManager } from '../utils/config-manager';

export class VercelProvider extends Provider {
  private templateEngine: TemplateEngine;
  private configManager: ConfigManager;
  
  constructor() {
    super();
    this.templateEngine = TemplateEngine.getInstance();
    this.configManager = ConfigManager.getInstance();
  }
  
  async generate(resource: string, options: ProviderOptions): Promise<void> {
    const supportedResources = ['app', 'domain'];
    
    if (!supportedResources.includes(resource)) {
      throw new Error(`Unsupported Vercel resource: ${resource}. Supported: ${supportedResources.join(', ')}`);
    }
    
    if (!options.name) {
      throw new Error('Resource name is required (use -n or --name)');
    }
    
    const templateData = {
      name: options.name,
      domain: options.domain
    };
    
    // Check if Vercel is configured
    if (!this.isConfigured()) {
      console.log('\n⚠️  Vercel credentials not configured. Run: tf config setup --provider vercel');
      console.log('   Or set environment variable: VERCEL_API_TOKEN\n');
    }
    
    const templatePath = this.templateEngine.getTemplatePath('vercel', resource);
    const content = this.templateEngine.render(templatePath, templateData);
    
    this.writeToFile(`vercel-${resource}-${options.name}.tf`, content);
  }
  
  private isConfigured(): boolean {
    const detected = this.configManager.detectExistingCredentials();
    return detected.vercel || this.configManager.hasProvider('vercel');
  }
}