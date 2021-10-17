import * as devkit from '@nrwl/devkit';
import { readJson, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import generator from './generator';
import { GeneratorOptions } from './schema';

describe('application generator', () => {
  let tree: Tree;
  const options: GeneratorOptions = { name: 'app1' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  test('should add project configuration', async () => {
    await generator(tree, options);

    const config = readProjectConfiguration(tree, options.name);
    expect(config).toMatchSnapshot();
  });

  test('should generate files', async () => {
    await generator(tree, options);

    expect(
      tree.exists(`apps/${options.name}/public/assets/logo.svg`)
    ).toBeTruthy();
    expect(
      tree.exists(`apps/${options.name}/public/styles/global.css`)
    ).toBeTruthy();
    expect(
      tree.exists(`apps/${options.name}/public/styles/home.css`)
    ).toBeTruthy();
    expect(tree.exists(`apps/${options.name}/public/favicon.ico`)).toBeTruthy();
    expect(tree.exists(`apps/${options.name}/public/robots.txt`)).toBeTruthy();
    expect(
      tree.exists(`apps/${options.name}/src/components/Tour.astro`)
    ).toBeTruthy();
    expect(
      tree.exists(`apps/${options.name}/src/pages/index.astro`)
    ).toBeTruthy();
    expect(tree.exists(`apps/${options.name}/astro.config.mjs`)).toBeTruthy();
    expect(tree.exists(`apps/${options.name}/tsconfig.json`)).toBeTruthy();
  });

  test('should format files', async () => {
    jest.spyOn(devkit, 'formatFiles');

    await generator(tree, options);

    expect(devkit.formatFiles).toHaveBeenCalled();
  });

  describe('--directory', () => {
    test('should add project with the right name when a directory is provided', async () => {
      const directory = 'some-directory/sub-directory';

      await generator(tree, { ...options, directory });

      const project = readProjectConfiguration(
        tree,
        `some-directory-sub-directory-${options.name}`
      );
      expect(project).toBeTruthy();
    });

    test('should generate files in the right directory', async () => {
      const directory = 'some-directory/sub-directory';

      await generator(tree, { ...options, directory });

      expect(
        tree.exists(`apps/${directory}/${options.name}/public/assets/logo.svg`)
      ).toBeTruthy();
      expect(
        tree.exists(
          `apps/${directory}/${options.name}/public/styles/global.css`
        )
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/public/styles/home.css`)
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/public/favicon.ico`)
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/public/robots.txt`)
      ).toBeTruthy();
      expect(
        tree.exists(
          `apps/${directory}/${options.name}/src/components/Tour.astro`
        )
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/src/pages/index.astro`)
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/astro.config.mjs`)
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${directory}/${options.name}/tsconfig.json`)
      ).toBeTruthy();
    });
  });

  describe('--tags', () => {
    test('should add project tags when provided', async () => {
      await generator(tree, { ...options, tags: 'foo, bar' });

      const { tags } = readProjectConfiguration(tree, options.name);
      expect(tags).toEqual(['foo', 'bar']);
    });
  });

  describe('--renderers', () => {
    test('should install no renderer when none are provided', async () => {
      const installRenderersTask = await generator(tree, options);

      expect(installRenderersTask).toBeUndefined();
      const { devDependencies } = readJson(tree, 'package.json');
      expect(devDependencies['@astrojs/renderer-preact']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-react']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-solid']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-svelte']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-vue']).toBeUndefined();
    });

    test('should install provided renderers', async () => {
      const installRenderersTask = await generator(tree, {
        ...options,
        renderers: ['@astrojs/renderer-preact', '@astrojs/renderer-solid'],
      });

      expect(installRenderersTask).toBeTruthy();
      const { devDependencies } = readJson(tree, 'package.json');
      expect(devDependencies['@astrojs/renderer-preact']).toBe('latest');
      expect(devDependencies['@astrojs/renderer-solid']).toBe('latest');
      expect(devDependencies['@astrojs/renderer-react']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-svelte']).toBeUndefined();
      expect(devDependencies['@astrojs/renderer-vue']).toBeUndefined();
    });
  });
});