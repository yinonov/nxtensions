import { ExecutorContext, logger } from '@nrwl/devkit';
import { ChildProcess, fork } from 'child_process';
import { join } from 'path';
import { PreviewExecutorOptions } from './schema';

let childProcess: ChildProcess;

export async function* previewExecutor(
  options: PreviewExecutorOptions,
  context: ExecutorContext
): AsyncGenerator<{ baseUrl?: string; success: boolean }> {
  const projectRoot = join(
    context.root,
    context.workspace.projects[context.projectName].root
  );

  try {
    const success = await runCliPreview(projectRoot, options);

    // TODO: build url from what's in the Astro config once the CLI API is available.
    // See https://github.com/snowpackjs/astro/issues/1483.
    yield { baseUrl: `http://localhost:3000`, success };

    // This Promise intentionally never resolves, leaving the process running
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise<{ success: boolean }>(() => {});
  } catch (e) {
    logger.error(e);

    yield { success: false };
  } finally {
    if (childProcess) {
      childProcess.kill();
    }
  }
}

export default previewExecutor;

function runCliPreview(
  projectRoot: string,
  options: PreviewExecutorOptions
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // TODO: use Astro CLI API once it's available.
    // See https://github.com/snowpackjs/astro/issues/1483.
    childProcess = fork(
      require.resolve('astro'),
      ['preview', ...getAstroPreviewArgs(options)],
      {
        cwd: projectRoot,
        env: { ...process.env, FORCE_COLOR: 'true' },
        stdio: 'pipe',
      }
    );

    // Ensure the child process is killed when the parent exits
    process.on('exit', () => childProcess.kill());
    process.on('SIGTERM', () => childProcess.kill());

    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);

      if (data.toString().includes('Preview server started in')) {
        resolve(true);
      }
    });
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
    childProcess.on('exit', (code) => {
      if (code !== 0) {
        reject(
          new Error('Could not start Astro Preview Server. See errors above.')
        );
      }
    });
  });
}

function getAstroPreviewArgs(options: PreviewExecutorOptions): string[] {
  const args: string[] = [];

  if (options.silent) {
    args.push('--silent');
  }
  if (options.verbose) {
    args.push('--verbose');
  }

  return args;
}
