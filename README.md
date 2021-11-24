# BigQuery Runner

A Visual Studio Code ("VS Code") extension that can query Google Cloud Platform's [BigQuery analytics database](https://cloud.google.com/bigquery/) from, and return results to, your editor. This extension allows you to:

- Write SQL in VS Code and query BigQuery datasets directly
- Create queries from selected text
- Capture results into VS Code window to manipulate them further

This extension is great if you're exploring BigQuery and prefer VS Code's editing environment, or for cases where you're writing documentation (hint: use "Run selected text as query") and want to double check that the query is valid.

## Installing

[BigQuery Runner \- Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=minodisk.bigquery-runner)

## Usage

The BigQuery extension adds a number of commands to the command palette (Cmd/Ctrl+Shift+P).

By default, it will look for your `GOOGLE_APPLICATION_CREDENTIALS` environmental variable (if set) and use the service account described in that JSON file. You can also explicitly set `bigquery.keyFilename` to the path of your [Service Account key file](https://cloud.google.com/docs/authentication/getting-started). Unless necessary, it's recommended that you scope this key to the [`roles.bigquery.user`](https://cloud.google.com/bigquery/docs/access-control#permissions_and_roles) role, which is sufficient for querying and most related tasks.

## Optional Configuration

The extension can be customized by modifying your `settings.json` file. The available configuration options, and their defaults, are below.

```js
"bigquery.keyFilename" = "" // the fully-qualified path to the service account file you downloaded - e.g. '/home/you/mykeyfile-1313ef.json'
"bigquery.projectId" = "" // only needed if your key file is not in JSON format - e.g. 'funny-horse-1234'
"bigquery.useLegacySql" = false // use the legacy SQL language when making queries.
"bigquery.maximumBytesBilled" = null // Unlimited
"bigquery.location" = "US" // Defaults to "US"
"bigquery.outputFormat" = "json" // "json", "csv"
```

The majority of these settings are inherited from [`ClientConfig`](https://cloud.google.com/nodejs/docs/reference/bigquery/1.3.x/global#ClientConfig) in the underlying BigQuery client library.

## Contributing

Feature requests are accepted, but please raise an issue describing your feature before sending a PR. This extension focuses on _querying_ BigQuery, rather than dataset- and/or table- level functionality.

This is not an officially supported Google product.

## License

Apache 2.0 licensed. See the LICENSE file for details.
