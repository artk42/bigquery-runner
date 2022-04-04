import { format as formatBytes } from "bytes";
import { createFlat, Output } from "core";
import { OutputChannel } from ".";
import { RunJobResponse } from "./runJobManager";
import { ErrorWithId } from "./runner";
import { StatusManager } from "./statusManager";

export type Renderer = ReturnType<typeof createRenderer>;

export function createRenderer({
  outputChannel,
  statusManager,
}: {
  readonly outputChannel: OutputChannel;
  readonly statusManager: StatusManager;
}) {
  return {
    async render({
      fileName,
      output,
      response: {
        jobId,
        results,
        info: { query, schema, numRows },
      },
    }: {
      readonly fileName: string;
      readonly output: Output;
      readonly response: RunJobResponse;
    }) {
      try {
        statusManager.loadBilled({ fileName });

        outputChannel.appendLine(`Result: ${results.structs.length} rows`);
        const bytes = formatBytes(parseInt(query.totalBytesBilled, 10));
        outputChannel.appendLine(
          `Result: ${bytes} to be billed (cache: ${query.cacheHit})`
        );

        const flat = createFlat(schema.fields);
        await output.writeHeads({ flat });
        await output.writeRows({ ...results, numRows, flat });

        // const bytesWritten = await output.bytesWritten();
        // if (bytesWritten !== undefined) {
        //   outputChannel.appendLine(
        //     `Total bytes written: ${formatBytes(bytesWritten)}`
        //   );
        // }

        statusManager.succeedBilled({
          fileName,
          billed: { bytes, cacheHit: query.cacheHit },
        });
      } catch (err) {
        statusManager.errorBilled({ fileName });
        // statusManager.hide();
        if (jobId) {
          throw new ErrorWithId(err, jobId);
        } else {
          throw err;
        }
      }
    },

    dispose() {
      // do nothing
    },
  };
}