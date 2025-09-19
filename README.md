# Beekeeper Studio Sample Plugin

A sample plugin demonstrating form creation, data persistence, and cross-view communication in Beekeeper Studio.

## Development Setup

### Prerequisites

- [Beekeeper Studio](https://beekeeperstudio.io) installed
- Node.js 20.19 or later
- Yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/beekeeper-studio/bks-plugin-starter
   cd bks-sample-plugin
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Create a symbolic link to the plugin directory**

   **Linux:**
   ```bash
   # Create the plugins directory if it doesn't exist
   mkdir -p ~/.config/beekeeper-studio/plugins

   # Create a symbolic link
   ln -s $(pwd) ~/.config/beekeeper-studio/plugins/bks-sample-plugin
   ```

   **macOS:**
   ```bash
   # Create the plugins directory if it doesn't exist
   mkdir -p "~/Library/Application Support/beekeeper-studio/plugins"

   # Create a symbolic link
   ln -s $(pwd) "~/Library/Application Support/beekeeper-studio/plugins/bks-sample-plugin"
   ```

   **Windows:**
   ```cmd
   # Create a symbolic link (run as Administrator)
   mklink /D "%APPDATA%\beekeeper-studio\plugins\bks-sample-plugin" "%CD%"
   ```

   **Windows (Portable version):**
   ```cmd
   # For portable installations
   mklink /D "/path/to/beekeeper-studio/beekeeper-studio-data/plugins/bks-sample-plugin" "%CD%"
   ```

   **Note**: The symlink name (`bks-sample-plugin`) must match the `id` field in `manifest.json`.

4. **Start development server**
   ```bash
   yarn dev
   ```

5. **For production build**
   ```bash
   yarn build
   ```

### Development Workflow

- The plugin will hot-reload when you make changes to the source files
- Check the browser dev tools for any errors or debugging output

## Publishing

### Automated Release

1. **Create and push a version tag**
   ```bash
   # Ensure your version in manifest.json matches the tag (e.g., "1.0.0")
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Mark as latest release**
   - Once the GitHub Action completes, go to your repository's Releases page
   - Find the newly created release and mark it as "Latest release"

### Manual Release

If you don't have the GitHub Actions workflow set up:

1. **Build the plugin**
   ```bash
   yarn build
   ```

2. **Create the plugin archive**
   ```bash
   # Create a zip file with the correct naming format
   zip -r bks-sample-plugin-1.0.0.zip dist/
   ```

3. **Create a release manually on GitHub**
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Tag version: `v1.0.0` (matching your manifest.json version)

4. **Attach the required assets**
   - Upload the `manifest.json` file
   - Upload the `bks-sample-plugin-1.0.0.zip` file you created in step 2

5. **Publish the release**
   - Add a title and description for your release
   - Click "Publish release"

### Publishing to Plugin Registry

To make your plugin discoverable in Beekeeper Studio's plugin manager:

1. **Fork the plugins registry**
   ```bash
   git clone https://github.com/beekeeper-studio/beekeeper-studio-plugins.git
   ```

2. **Add your plugin to plugins.json**
   ```json
   {
     "id": "bks-sample-plugin",
     "name": "Sample Plugin",
     "author": "Your Name",
     "description": "A sample plugin demonstrating form creation, data persistence, and cross-view communication in Beekeeper Studio",
     "repo": "yourusername/bks-sample-plugin"
   }
   ```

3. **Submit a pull request**
   - Create a PR to the main repository
   - Once approved, your plugin will be available in the plugin manager

## API Reference

For complete API documentation, visit the [Beekeeper Studio Plugin Development Guide](https://docs.beekeeperstudio.io/plugin_development/api-reference/).

## Support

- **Community Slack**: Join the [Beekeeper Studio Community](https://www.beekeeperstudio.io/slack)
- **Issues**: Report bugs or request features in the [main repository](https://github.com/beekeeper-studio/beekeeper-studio/issues)
- **Documentation**: Visit [docs.beekeeperstudio.io](https://docs.beekeeperstudio.io) for comprehensive guides

## License

MIT
