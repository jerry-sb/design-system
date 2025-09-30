---
'@jerryshim/theme-builder': patch
---

Constrain published contents via top-level `files` to include only `dist/`, `bin/`, `README.md`, and `LICENSE`. This removes `src/` and config files from the tarball. No runtime or API changes.
