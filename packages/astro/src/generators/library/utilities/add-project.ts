import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import { NormalizedGeneratorOptions } from '../schema';

export function addProject(
  tree: Tree,
  options: NormalizedGeneratorOptions
): void {
  addProjectConfiguration(
    tree,
    options.projectName,
    {
      root: options.projectRoot,
      sourceRoot: options.projectRoot,
      projectType: 'library',
      targets: {},
      tags: options.parsedTags,
    },
    options.standaloneConfig
  );
}