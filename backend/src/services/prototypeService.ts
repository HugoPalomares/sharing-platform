import { prisma } from './database';
import { CreatePrototypeRequest, UpdatePrototypeRequest } from '../types/prototype';
import { parseGitHubUrl } from '../utils/github';

export class PrototypeService {
  async createPrototype(data: CreatePrototypeRequest, createdBy: string) {
    const { gitHubOwner, gitHubRepoName } = parseGitHubUrl(data.gitHubRepoUrl);
    
    // Check if prototype already exists for this repo
    const existingPrototype = await prisma.prototype.findFirst({
      where: {
        gitHubOwner,
        gitHubRepoName,
        isActive: true,
      },
    });

    if (existingPrototype) {
      throw new Error('A prototype for this repository already exists');
    }

    const prototypeUrl = `/prototype/${Date.now()}-${gitHubRepoName}`;

    const prototype = await prisma.prototype.create({
      data: {
        name: data.name,
        description: data.description,
        gitHubRepoUrl: data.gitHubRepoUrl,
        gitHubRepoName,
        gitHubOwner,
        createdBy,
        prototypeUrl,
      },
      include: {
        gitHubIntegration: true,
        buildHistory: {
          take: 5,
          orderBy: { buildStartedAt: 'desc' },
        },
      },
    });

    return prototype;
  }

  async getPrototypes(createdBy?: string) {
    const where = createdBy ? { createdBy, isActive: true } : { isActive: true };
    
    const prototypes = await prisma.prototype.findMany({
      where,
      include: {
        gitHubIntegration: true,
        buildHistory: {
          take: 1,
          orderBy: { buildStartedAt: 'desc' },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return prototypes;
  }

  async getPrototypeById(id: string, userId?: string) {
    const prototype = await prisma.prototype.findFirst({
      where: {
        id,
        isActive: true,
        ...(userId && { createdBy: userId }),
      },
      include: {
        gitHubIntegration: true,
        buildHistory: {
          orderBy: { buildStartedAt: 'desc' },
        },
      },
    });

    if (!prototype) {
      throw new Error('Prototype not found');
    }

    return prototype;
  }

  async updatePrototype(id: string, data: UpdatePrototypeRequest, userId: string) {
    const prototype = await prisma.prototype.findFirst({
      where: {
        id,
        createdBy: userId,
        isActive: true,
      },
    });

    if (!prototype) {
      throw new Error('Prototype not found or unauthorized');
    }

    const updatedPrototype = await prisma.prototype.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        gitHubIntegration: true,
        buildHistory: {
          take: 5,
          orderBy: { buildStartedAt: 'desc' },
        },
      },
    });

    return updatedPrototype;
  }

  async deletePrototype(id: string, userId: string) {
    const prototype = await prisma.prototype.findFirst({
      where: {
        id,
        createdBy: userId,
        isActive: true,
      },
    });

    if (!prototype) {
      throw new Error('Prototype not found or unauthorized');
    }

    // Soft delete
    await prisma.prototype.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  async updateBuildStatus(id: string, status: string, errorMessage?: string) {
    const prototype = await prisma.prototype.update({
      where: { id },
      data: {
        buildStatus: status,
        buildErrorMessage: errorMessage,
        ...(status === 'success' && { lastDeployedAt: new Date() }),
      },
    });

    return prototype;
  }

  async addBuildHistory(prototypeId: string, buildData: {
    gitCommitSha?: string;
    gitCommitMessage?: string;
    buildStatus: string;
    buildLogs?: string;
    errorMessage?: string;
  }) {
    const buildHistory = await prisma.buildHistory.create({
      data: {
        prototypeId,
        ...buildData,
      },
    });

    return buildHistory;
  }

  async completeBuild(buildHistoryId: string, success: boolean, logs?: string, errorMessage?: string) {
    const endTime = new Date();
    
    const buildHistory = await prisma.buildHistory.findUnique({
      where: { id: buildHistoryId },
    });

    if (!buildHistory) {
      throw new Error('Build history not found');
    }

    const durationMs = endTime.getTime() - buildHistory.buildStartedAt.getTime();

    const updatedBuildHistory = await prisma.buildHistory.update({
      where: { id: buildHistoryId },
      data: {
        buildStatus: success ? 'success' : 'failed',
        buildCompletedAt: endTime,
        buildDurationMs: durationMs,
        buildLogs: logs,
        errorMessage: errorMessage,
      },
    });

    // Update prototype status
    await this.updateBuildStatus(
      buildHistory.prototypeId,
      success ? 'success' : 'failed',
      errorMessage
    );

    return updatedBuildHistory;
  }
}