import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export class TemplateEngine {
  private static instance: TemplateEngine;
  
  private constructor() {
    this.registerHelpers();
  }
  
  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }
  
  private registerHelpers(): void {
    Handlebars.registerHelper('kebabCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });
    
    Handlebars.registerHelper('snakeCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    });
    
    Handlebars.registerHelper('pascalCase', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    });
  }
  
  public render(templatePath: string, data: Record<string, any>): string {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(data);
  }
  
  public renderFromString(templateString: string, data: Record<string, any>): string {
    const template = Handlebars.compile(templateString);
    return template(data);
  }
  
  public getTemplatePath(provider: string, resource: string): string {
    return path.join(__dirname, '..', 'templates', provider, `${resource}.hbs`);
  }
}