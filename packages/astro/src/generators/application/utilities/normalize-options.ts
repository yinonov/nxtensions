import { getWorkspaceLayout, names, Tree } from '@nrwl/devkit';
import { GeneratorOptions, NormalizedGeneratorOptions } from '../schema';

export function normalizeOptions(
  tree: Tree,
  options: GeneratorOptions
): NormalizedGeneratorOptions {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(/\//g, '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((tag) => tag.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    renderers: options.renderers ?? [],
  };
}