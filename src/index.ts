#!/usr/bin/env node

import { Command } from 'commander';
import { AwsProvider } from './providers/aws';
import { VercelProvider } from './providers/vercel';
import { GcpProvider } from './providers/gcp';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('tf')
  .description('Terraform boilerplate generator')
  .version('1.0.0');

program
  .command('aws')
  .description('Generate AWS Terraform configurations')
  .argument('<resource>', 'AWS resource type (lambda, s3, ec2)')
  .option('-n, --name <name>', 'Resource name')
  .option('-r, --runtime <runtime>', 'Runtime (for Lambda)')
  .option('-R, --region <region>', 'AWS region')
  .action(async (resource, options) => {
    const provider = new AwsProvider();
    await provider.generate(resource, options);
  });

program
  .command('vercel')
  .description('Generate Vercel Terraform configurations')
  .argument('<resource>', 'Vercel resource type (app, domain)')
  .option('-n, --name <name>', 'Resource name')
  .option('-d, --domain <domain>', 'Custom domain')
  .action(async (resource, options) => {
    const provider = new VercelProvider();
    await provider.generate(resource, options);
  });

program
  .command('gcp')
  .description('Generate GCP Terraform configurations')
  .argument('<resource>', 'GCP resource type (storage, function, compute)')
  .option('-n, --name <name>', 'Resource name')
  .option('-r, --region <region>', 'GCP region')
  .action(async (resource, options) => {
    const provider = new GcpProvider();
    await provider.generate(resource, options);
  });

program
  .command('init')
  .description('Initialize Terraform project structure')
  .action(() => {
    console.log('Initializing Terraform project...');
    // TODO: Implement project initialization
  });

program.addCommand(configCommand);

program.parse();