/**
 * SKILL.md Parser - Extracts structured metadata from markdown skill files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { marked } from 'marked';
import yaml from 'js-yaml';
import { SkillMetadata, SkillParameter } from '../types/skills';

export class SkillParser {
  private baseSkillsPath: string;

  constructor(baseSkillsPath: string = '../../antigravity-awesome-skills/skills') {
    this.baseSkillsPath = path.resolve(__dirname, baseSkillsPath);
  }

  /**
   * Parse a single SKILL.md file
   */
  async parseSkill(skillPath: string): Promise<SkillMetadata | null> {
    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      return this.parseContent(content, path.basename(path.dirname(skillPath)));
    } catch (error) {
      console.error(`Failed to parse skill at ${skillPath}:`, error);
      return null;
    }
  }

  /**
   * Parse skill content from markdown string
   */
  parseContent(content: string, skillId: string): SkillMetadata {
    const lines = content.split('\n');
    const metadata: Partial<SkillMetadata> = {
      id: skillId,
      name: skillId,
      description: '',
      category: 'general',
      tags: [],
      version: '1.0.0',
      author: 'unknown',
      riskLevel: 'medium',
      capabilities: [],
      dependencies: [],
      parameters: [],
      examples: [],
      documentation: content
    };

    let currentSection = '';
    let parameterList: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect YAML frontmatter
      if (line.trim() === '---' && currentSection === '' && i < 10) {
        const yamlEnd = lines.indexOf('---', i + 1);
        if (yamlEnd !== -1) {
          const yamlContent = lines.slice(i + 1, yamlEnd).join('\n');
          try {
            const frontmatter = yaml.load(yamlContent) as any;
            if (frontmatter) {
              Object.assign(metadata, {
                name: frontmatter.name || metadata.name,
                description: frontmatter.description || metadata.description,
                category: frontmatter.category || metadata.category,
                tags: frontmatter.tags || metadata.tags,
                version: frontmatter.version || metadata.version,
                author: frontmatter.author || metadata.author,
                riskLevel: frontmatter.riskLevel || metadata.riskLevel,
                capabilities: frontmatter.capabilities || metadata.capabilities
              });
            }
          } catch (e) {
            // Invalid YAML, skip frontmatter
          }
          i = yamlEnd;
          continue;
        }
      }

      // Detect headers
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headerMatch) {
        const headerText = headerMatch[1].toLowerCase();
        currentSection = headerText;

        if (headerText.includes('description')) {
          // Description section - collect next few lines
          const descLines = [];
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].trim() && !lines[j].startsWith('#')) {
              descLines.push(lines[j].trim());
            } else if (lines[j].startsWith('#')) {
              break;
            }
          }
          if (descLines.length > 0 && !metadata.description) {
            metadata.description = descLines.join(' ').substring(0, 500);
          }
        }
        continue;
      }

      // Extract specific metadata from sections
      if (currentSection.includes('parameters') || currentSection.includes('arguments')) {
        const paramMatch = line.match(/^-\s*(.+?):\s*(.+)$/);
        if (paramMatch) {
          const [, paramName, paramDesc] = paramMatch;
          const paramType = this.extractType(paramDesc);
          const required = paramDesc.toLowerCase().includes('required');

          parameterList.push({
            name: paramName.trim(),
            type: paramType,
            required,
            description: paramDesc
          });
        }
      }

      if (currentSection.includes('category')) {
        const categoryMatch = line.match(/category[:\s]+(.+)/i);
        if (categoryMatch) {
          metadata.category = categoryMatch[1].trim().toLowerCase();
        }
      }

      if (currentSection.includes('example') || currentSection.includes('usage')) {
        if (line.startsWith('```') || line.trim().startsWith('>')) {
          // Example code block or quote
          const exampleText = line.replace(/^[>`]*\s*/, '').trim();
          if (exampleText.length > 10) {
            metadata.examples!.push(exampleText);
          }
        } else if (line.trim() && !line.startsWith('#')) {
          const exampleText = line.trim();
          if (exampleText.length > 5 && exampleText.length < 200) {
            metadata.examples!.push(exampleText);
          }
        }
      }

      if (currentSection.includes('capabilities')) {
        const capabilityMatch = line.match(/^[-*]\s*(.+)$/);
        if (capabilityMatch) {
          metadata.capabilities!.push(capabilityMatch[1].trim());
        }
      }

      if (currentSection.includes('dependencies')) {
        const depMatch = line.match(/^[-*]\s*(.+)$/);
        if (depMatch) {
          metadata.dependencies!.push(depMatch[1].trim());
        }
      }
    }

    metadata.parameters = this.parseParameters(parameterList);

    // Infer category from tags or ID if not set
    if (!metadata.category || metadata.category === 'general') {
      metadata.category = this.inferCategory(skillId, metadata.tags!);
    }

    // Infer risk level from capabilities
    if (!metadata.riskLevel || metadata.riskLevel === 'medium') {
      metadata.riskLevel = this.inferRiskLevel(metadata.capabilities!, metadata.id!);
    }

    // Default description if not found
    if (!metadata.description || metadata.description.length < 10) {
      metadata.description = `AI skill for ${metadata.name}`;
    }

    return metadata as SkillMetadata;
  }

  /**
   * Extract parameter type from description
   */
  private extractType(description: string): SkillParameter['type'] {
    const desc = description.toLowerCase();

    if (desc.includes('number') || desc.includes('integer') || desc.includes('count')) {
      return 'number';
    }
    if (desc.includes('boolean') || desc.includes('flag') || desc.includes('true/false')) {
      return 'boolean';
    }
    if (desc.includes('array') || desc.includes('list') || desc.includes('[]')) {
      return 'array';
    }
    if (desc.includes('object') || desc.includes('json') || desc.includes('map')) {
      return 'object';
    }
    if (desc.includes('file') || desc.includes('path') || desc.includes('filepath')) {
      return 'file';
    }
    if (desc.includes('url') || desc.includes('link') || desc.includes('http')) {
      return 'url';
    }

    return 'string';
  }

  /**
   * Parse and normalize parameters
   */
  private parseParameters(rawParams: any[]): SkillParameter[] {
    return rawParams.map(param => ({
      name: param.name,
      type: param.type,
      required: param.required || false,
      description: param.description || param.name,
      default: param.default,
      enum: param.enum,
      validation: param.validation
    }));
  }

  /**
   * Infer category from skill ID and tags
   */
  private inferCategory(skillId: string, tags: string[]): string {
    const idLower = skillId.toLowerCase();

    // Check tags first
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('security') || tagLower.includes('pentest') || tagLower.includes('vulnerability')) {
        return 'security';
      }
      if (tagLower.includes('devops') || tagLower.includes('deployment') || tagLower.includes('infrastructure')) {
        return 'infrastructure';
      }
      if (tagLower.includes('test') || tagLower.includes('qa')) {
        return 'testing';
      }
      if (tagLower.includes('ai') || tagLower.includes('llm') || tagLower.includes('machine learning')) {
        return 'data-ai';
      }
    }

    // Check skill ID
    if (idLower.includes('security') || idLower.includes('pentest') || idLower.includes('hack') || idLower.includes('attack')) {
      return 'security';
    }
    if (idLower.includes('devops') || idLower.includes('deploy') || idLower.includes('cloud') || idLower.includes('aws')) {
      return 'infrastructure';
    }
    if (idLower.includes('test') || idLower.includes('qa') || idLower.includes('spec')) {
      return 'testing';
    }
    if (idLower.includes('arch') || idLower.includes('design') || idLower.includes('system')) {
      return 'architecture';
    }
    if (idLower.includes('ai') || idLower.includes('llm') || idLower.includes('rag')) {
      return 'data-ai';
    }
    if (idLower.includes('react') || idLower.includes('frontend') || idLower.includes('ui')) {
      return 'development';
    }

    return 'general';
  }

  /**
   * Infer risk level from capabilities and ID
   */
  private inferRiskLevel(capabilities: string[], skillId: string): SkillMetadata['riskLevel'] {
    const capsLower = capabilities.join(' ').toLowerCase();
    const idLower = skillId.toLowerCase();

    // Critical: file deletion, system modification, payment operations
    if (
      idLower.includes('delete') ||
      idLower.includes('destroy') ||
      idLower.includes('wipe') ||
      capsLower.includes('delete') ||
      capsLower.includes('remove file') ||
      capsLower.includes('payment') ||
      capsLower.includes('money') ||
      capsLower.includes('credentials')
    ) {
      return 'critical';
    }

    // High: system access, code execution, data modification
    if (
      idLower.includes('exec') ||
      idLower.includes('run') ||
      idLower.includes('system') ||
      capsLower.includes('execute') ||
      capsLower.includes('system') ||
      capsLower.includes('modify') ||
      capsLower.includes('write') ||
      capsLower.includes('database')
    ) {
      return 'high';
    }

    // Medium: API calls, data access, external services
    if (
      idLower.includes('api') ||
      idLower.includes('fetch') ||
      idLower.includes('scrape') ||
      capsLower.includes('api') ||
      capsLower.includes('http') ||
      capsLower.includes('external')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Parse all skills in a directory
   */
  async parseSkillsDirectory(dirPath?: string): Promise<SkillMetadata[]> {
    const basePath = dirPath || this.baseSkillsPath;
    const skills: SkillMetadata[] = [];

    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = path.join(basePath, entry.name, 'SKILL.md');
          try {
            await fs.access(skillPath);
            const skill = await this.parseSkill(skillPath);
            if (skill) {
              skills.push(skill);
            }
          } catch {
            // No SKILL.md file, skip
          }
        }
      }
    } catch (error) {
      console.error(`Failed to read skills directory: ${basePath}`, error);
    }

    return skills;
  }
}
