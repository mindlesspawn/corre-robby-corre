# The little pictures

These are the small pictures the game shows in place of emoji: the things to find, the
game icons, the level stickers, the stars, the flags and the pictures on buttons.

They are from **Noto Emoji** by Google, release `v2026-09-24-unicode18_0`:
https://github.com/googlefonts/noto-emoji

The files are used exactly as they are in that release, with their own names
(`emoji_u1f451.svg` is 👑). Nothing in them has been changed. `scripts/fetch-emoji.mjs`
downloads them, and `src/emoji.js` shows them.

## Licences

| Files | From | Licence |
| --- | --- | --- |
| `emoji_u*.svg`, except the two flags | `2D/svg/` in Noto Emoji | Apache License 2.0, copyright 2013 Google, Inc. The notice that sits beside these files in Noto Emoji is `LICENSE.txt`, and the full licence is `LICENSE-Apache-2.0.txt`. |
| `emoji_u1f1f2_1f1fd.svg` (Mexico) and `emoji_u1f1fa_1f1f8.svg` (United States) | `third_party/region-flags/waved-svg/` in Noto Emoji | Public domain, or otherwise exempt from copyright. See `LICENSE-flags.txt`. |

Noto Emoji's own README says: "Tools and most image resources are under the Apache
license, version 2.0", and that the flag images "are in the public domain or otherwise
exempt from copyright". The licence file at the top of that project is the SIL Open Font
License 1.1, which covers its fonts; a copy is here as `LICENSE-OFL-1.1.txt`, so that
whichever of the two is taken to cover the pictures, its text travels with them. Both
allow the pictures to be bundled in an app, free or paid, as long as the licence comes
along.
