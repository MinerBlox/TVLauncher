# Tonight TV branding assets

The implementation on the `design/white-dotted-tv-ui` branch supports six locally bundled streaming logo images:

- `src/access/brands/netflix.jpg`
- `src/access/brands/disney.jpg`
- `src/access/brands/iplayer.jpg`
- `src/access/brands/youtube.jpg`
- `src/access/brands/itvx.jpg`
- `src/access/brands/appletv.jpg`

These files are kept separate from the source branch for now. Use the logo images supplied by the project owner, at a 540×330 aspect ratio (or crop proportionately). When the image is present it is shown for that streaming-service tile. Simulator previews fall back to built-in illustrative SVG artwork if the file has not been added.

The centre Apps/grid button is sorted to slot 4 of a seven-item dock containing six pinned apps. The real TV retains OpenLauncher's app-launching logic; icon images are purely artwork, not evidence an app is installed.

To test in the simulator, add these six image files to `src/access/brands/` of the extracted development branch, then File → Launch App → select `src`.
