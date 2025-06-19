export interface ProviderOptions {
  name?: string;
  region?: string;
  runtime?: string;
  domain?: string;
}

export interface TerraformResource {
  provider: string;
  resource: string;
  name: string;
  config: Record<string, any>;
}

export abstract class Provider {
  abstract generate(resource: string, options: ProviderOptions): Promise<void>;
  
  protected writeToFile(filename: string, content: string): void {
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = './terraform';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`Generated: ${filePath}`);
  }
}