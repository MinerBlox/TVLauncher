# Bundled streaming icons

The branch now includes six vector streaming tiles directly in `src/access/brands/`:

- netflix.svg
- disney.svg
- iplayer.svg
- youtube.svg
- itvx.svg
- appletv.svg

The launcher automatically displays them for matching app names/IDs, or for simulator sample tiles. These are lightweight vector recreations of the supplied brand references, not byte-for-byte copies of the uploaded JPG images.

**To preview:** download or pull the current `design/white-dotted-tv-ui` branch, and select the `src` folder through Simulator → File → Launch App. No additional logo ZIP is needed.

Simulator sample tiles are not working streaming services. On the physical TV, launching installed apps still requires privilege and app-ID compatibility testing.
