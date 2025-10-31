# Beekeeper Studio Sample Plugin

A basic example of Beekeeper Studio plugin demonstrating form creation, data persistence, and cross-view communication.

## Usage

<img width="420" height="212" alt="image" src="https://github.com/user-attachments/assets/0d5889ae-67f5-4683-878e-e97d8dab9258" />

- Submit user ratings from `Tools > New Form`
- View the data from `Tools > View Summary`

## Development

> [!NOTE]
> This example does not use a UI framework for simplicity. But if you do, it supports hot reload! Thanks to Vite's [Hot Module Replacement](https://vite.dev/guide/features.html#hot-module-replacement). :tada:

> [!NOTE]
> Check the browser dev tools for debugging (`Help > Show Developer Tools`)

### Prerequisites

- Beekeeper Studio >= 5.4
- Node.js >= 20.19

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/beekeeper-studio/bks-sample-plugin
   cd bks-sample-plugin
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Create a symbolic link to the plugin directory
   > The symlink name must match the `id` field in `manifest.json`. For example, `bks-sample-plugin`.

   **Linux:**
   ```bash
   ln -s $(pwd) ~/.config/beekeeper-studio/plugins/bks-sample-plugin
   ```

   **macOS:**
   ```bash
   ln -s $(pwd) "~/Library/Application Support/beekeeper-studio/plugins/bks-sample-plugin"
   ```

   **Windows:**
   ```cmd
   mklink /D "%APPDATA%\beekeeper-studio\plugins\bks-sample-plugin" "%CD%"
   ```

   **Windows (Portable version):**
   ```cmd
   mklink /D "/path/to/beekeeper-studio/beekeeper-studio-data/plugins/bks-sample-plugin" "%CD%"
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

5. **For production build**
   ```bash
   yarn build
   ```

## Releasing & Publishing your plugin

### 1.a. Automated Release

This repository contains Github Actions workflow that automates the release process by pushing a tag prefixed with `v`:

1. Push a version tag
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Once the GitHub Action completes, go to your repository's Releases page
3. Find the release
4. Mark it as "Latest release"

### 1.b. Manual Release

If you don't have the GitHub Actions workflow set up:

1. Build the plugin
   ```bash
   yarn build
   ```

2. Create the plugin archive
   > The name format is `<pluginId>-<version>.zip`

   ```bash
   zip -r bks-sample-plugin-1.0.0.zip dist/
   ```

4. Go to your repository on GitHub
5. Click "Releases" → "Create a new release"
6. Tag the release with the version, for example, `v1.0.0` (prefixed with `v`)
7. For assets, attach the current `manifest.json` and the zip file
8. Fill the title and description
9. Click "Publish release"

### 2. Publishing to Plugin Registry 

To make your plugin discoverable in Beekeeper Studio's plugin manager:

1. Fork the plugins registry at [beekeeper-studio/beekeeper-studio-plugins](https://github.com/beekeeper-studio/beekeeper-studio-plugins)

2. Add your plugin to plugins.json
   ```json
   {
     "id": "bks-sample-plugin",
     "name": "Sample Plugin",
     "author": "Your Name",
     "description": "A sample plugin demonstrating form creation, data persistence, and cross-view communication in Beekeeper Studio",
     "repo": "yourusername/bks-sample-plugin"
   }
   ```

3. Submit a pull request to [beekeeper-studio/beekeeper-studio-plugins](https://github.com/beekeeper-studio/beekeeper-studio-plugins)
4. Once approved & merged by our team, your plugin will be available in Beekeeper Studio for public

## Support

- **Documentation**: Visit the [Plugin Development Guide](https://docs.beekeeperstudio.io/plugin_development/)
- **Community Slack**: Join the [Beekeeper Studio Community](https://www.beekeeperstudio.io/slack)
- **Issues**: Report bugs or request features in the [main repository](https://github.com/beekeeper-studio/beekeeper-studio/issues)

## License

MIT
