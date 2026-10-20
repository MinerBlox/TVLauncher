# Streaming artwork setup

The launcher expects the original uploaded logo artwork in `src/access/brands/` as `netflix.jpg`, `disney.jpg`, `iplayer.jpg`, `youtube.jpg`, `itvx.jpg`, and `appletv.jpg`.

The six imprecise hand-drawn SVG alternatives were removed. The real uploaded images are in the supplied `TVLauncher_official_icons.zip` package and are not yet committed to this branch. To include them, extract the package into the repository root and commit the `src/access/brands/*.jpg` files. GitHub's browser UI supports uploading files; the connector currently cannot upload binary files directly.

Until the actual JPGs are committed, the simulator uses bundled illustrative fallbacks. This is not an exact logo preview. Existing app launch logic remains unchanged.
