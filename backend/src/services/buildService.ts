import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { PrototypeService } from './prototypeService';

export class BuildService {
  private prototypeService: PrototypeService;
  private buildArtifactsPath: string;

  constructor() {
    this.prototypeService = new PrototypeService();
    this.buildArtifactsPath = process.env.BUILD_ARTIFACTS_PATH || './build-artifacts';
    this.ensureBuildDirectory();
  }

  private async ensureBuildDirectory() {
    try {
      await fs.mkdir(this.buildArtifactsPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create build artifacts directory:', error);
    }
  }

  async buildPrototype(prototypeId: string, gitHubRepoUrl: string): Promise<void> {
    let buildHistoryId: string | null = null;

    try {
      // Create build history entry
      const buildHistory = await this.prototypeService.addBuildHistory(prototypeId, {
        buildStatus: 'started',
        buildLogs: 'Starting build process...\n',
      });
      buildHistoryId = buildHistory.id;

      // Update prototype status
      await this.prototypeService.updateBuildStatus(prototypeId, 'building');

      // Clone repository
      const tempDir = path.join(this.buildArtifactsPath, 'temp', prototypeId);
      const outputDir = path.join(this.buildArtifactsPath, prototypeId);

      await this.runCommand('git', ['clone', gitHubRepoUrl, tempDir], {
        description: 'Cloning repository',
        buildHistoryId,
      });

      // Detect project type and build
      const projectType = await this.detectProjectType(tempDir);
      console.log(`Detected project type: ${projectType}`);

      let buildSuccess = false;
      let buildLogs = '';

      switch (projectType) {
        case 'react':
          buildLogs = await this.buildReactProject(tempDir, outputDir, buildHistoryId);
          buildSuccess = true;
          break;
        case 'static':
          buildLogs = await this.copyStaticFiles(tempDir, outputDir, buildHistoryId);
          buildSuccess = true;
          break;
        default:
          throw new Error(`Unsupported project type: ${projectType}`);
      }

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      // Complete build
      if (buildHistoryId) {
        await this.prototypeService.completeBuild(buildHistoryId, buildSuccess, buildLogs);
      }

      console.log(`Build completed successfully for prototype ${prototypeId}`);
    } catch (error: any) {
      console.error(`Build failed for prototype ${prototypeId}:`, error);

      if (buildHistoryId) {
        await this.prototypeService.completeBuild(
          buildHistoryId,
          false,
          undefined,
          error.message
        );
      }

      throw error;
    }
  }

  private async detectProjectType(projectPath: string): Promise<'react' | 'static' | 'unknown'> {
    try {
      // Check for package.json (Node.js project)
      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        
        // Check for React dependencies
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (dependencies.react || dependencies['@types/react']) {
          return 'react';
        }
      } catch {
        // package.json doesn't exist or is invalid
      }

      // Check for static files
      const files = await fs.readdir(projectPath);
      if (files.includes('index.html')) {
        return 'static';
      }

      return 'unknown';
    } catch (error) {
      console.error('Error detecting project type:', error);
      return 'unknown';
    }
  }

  private async buildReactProject(sourceDir: string, outputDir: string, buildHistoryId: string): Promise<string> {
    let logs = 'Building React project...\n';

    // Install dependencies
    logs += await this.runCommand('npm', ['install'], {
      cwd: sourceDir,
      description: 'Installing dependencies',
      buildHistoryId,
    });

    // Build project
    logs += await this.runCommand('npm', ['run', 'build'], {
      cwd: sourceDir,
      description: 'Building project',
      buildHistoryId,
    });

    // Copy build output
    const buildDir = path.join(sourceDir, 'build');
    const distDir = path.join(sourceDir, 'dist');
    
    let sourceOutput: string;
    if (await this.directoryExists(buildDir)) {
      sourceOutput = buildDir;
    } else if (await this.directoryExists(distDir)) {
      sourceOutput = distDir;
    } else {
      throw new Error('Build output directory not found (looked for /build and /dist)');
    }

    await this.copyDirectory(sourceOutput, outputDir);
    logs += `Copied build output from ${sourceOutput} to ${outputDir}\n`;

    return logs;
  }

  private async copyStaticFiles(sourceDir: string, outputDir: string, buildHistoryId: string): Promise<string> {
    const logs = 'Copying static files...\n';
    await this.copyDirectory(sourceDir, outputDir);
    return logs + `Copied static files from ${sourceDir} to ${outputDir}\n`;
  }

  private async runCommand(
    command: string,
    args: string[],
    options: {
      cwd?: string;
      description?: string;
      buildHistoryId?: string;
    } = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const { cwd, description = `Running ${command}` } = options;
      let output = '';

      console.log(`${description}: ${command} ${args.join(' ')}`);

      const childProcess = spawn(command, args, {
        cwd: cwd || process.cwd(),
        stdio: 'pipe',
      });

      childProcess.stdout?.on('data', (data: any) => {
        const text = data.toString();
        output += text;
        console.log(text);
      });

      childProcess.stderr?.on('data', (data: any) => {
        const text = data.toString();
        output += text;
        console.error(text);
      });

      childProcess.on('close', (code: any) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`${command} failed with exit code ${code}\n${output}`));
        }
      });

      childProcess.on('error', (error: any) => {
        reject(new Error(`Failed to start ${command}: ${error.message}`));
      });
    });
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });
    
    const items = await fs.readdir(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  async servePrototype(prototypeId: string, requestPath: string): Promise<Buffer | null> {
    try {
      const outputDir = path.join(this.buildArtifactsPath, prototypeId);
      let filePath = path.join(outputDir, requestPath);

      // If requesting a directory or root, try to serve index.html
      if (requestPath === '' || requestPath === '/' || (await this.directoryExists(filePath))) {
        filePath = path.join(outputDir, 'index.html');
      }

      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      console.error(`Error serving prototype ${prototypeId} file ${requestPath}:`, error);
      return null;
    }
  }
}