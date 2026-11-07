# Asset provenance

Original illustration and approved About/Contact mockups supplied by owner in the repository root. Résumé supplied as `NIVEDAN B R_Resume copy.pdf`; copied unchanged to `public/resume.pdf`.

Official logos retrieved November 7, 2026 and visually inspected:

- UW purple block W (current): https://www.washington.edu/brand/brand-elements/logos/ → https://cdn.uw.edu/wp-content/uploads/sites/230/2023/11/02134808/W-Logo_Purple_Hex.png . Gold original retained locally; switched to purple at the owner's request.
- Lawgical: https://lawgical.app/lawgical_logo_light_full.png
- U4U: https://www.u4uteen.com/ → https://static.wixstatic.com/media/ef74da_f7d7dce49fbb479f92251d671dbf779e~mv2.png
- RV University: https://admissions.rvu.edu.in/ → https://static.npfs.co/accounts/691/config/logo_1784875189.png (main site timed out; official admissions page supplies this asset). Original colors retained; light backing ensures legibility.
- Space Grotesk (toolkit and résumé section typography): https://github.com/google/fonts/tree/main/ofl/spacegrotesk ; local variable font and OFL license under `public/fonts/`.
- DM Sans: https://github.com/google/fonts/tree/main/ofl/dmsans ; local font and OFL license under `public/fonts/`.

## Illustration preparation

Built-in imagegen editing was used with the supplied original as the reference. Outputs preserved in `assets/source/`, optimized WebP files in `public/images/`.

Head prompt: “Produce ONLY an exact cutout of Simba the dog's head, including all crown fur and both ears and muzzle, ending at the blue collar. Remove absolutely everything else to transparent. Preserve the exact original head, colors, shape, details, grain and style; no redrawing or stylization. Full head fully visible with small transparent margin. This is a moving layer to composite over original artwork. Do not include the person, hands, phone or dog's body.”

Base prompt: “Return same 1024 x 1536 composition. Remove ONLY the dog's entire head and ears above its blue collar (approximately x150–465 y400–700). Repair the area by continuing the near-black background on the left and man's dark navy shirt/skin on right where the head used to be. Leave the blue collar and dog's body as a neutral neck base. Preserve every other pixel, the person, headphones, hands, phone, body and original texture, colors and style. This is a base layer for compositing the original head back on top. NO replacement head, no face or ears remaining; no hole or blank transparency.”

Cursor animation transforms only the independent head with a neck pivot. These edits are not new portraits or organization logos.

## Integration reference

ElevenLabs official React SDK documentation consulted: https://elevenlabs.io/docs/eleven-agents/libraries/react . Installed SDK types/source additionally verified because v1.21 session controls return void and report asynchronous errors through callbacks.

## Transparent portrait base

Built-in imagegen background-extraction edit of `assets/source/portrait-base-source.png`; published as `public/images/portrait-base-transparent.png`. The existing independent transparent head is losslessly converted to `public/images/simba-head.png` so both hero layers are PNG assets.

Prompt: “Remove ONLY the near-black background, producing a true transparent PNG alpha cutout. Preserve the SAME 1024x1536 canvas, subject scale, alignment, and every foreground detail: man, dark hair/headphones/beard, navy shirt, hands, phone, pants, headless dog's furry body and blue collar. The dog's head is deliberately absent because a separate animated head is composited on top: DO NOT add any dog's head, ears, eyes or face. Preserve empty transparent space where the dog's head was. Do not remove dark clothing as background. Keep exact silhouette edges, pose, colors, original flat illustration style. No new subject, no redraw, no shadows/halos/background glow, no checkerboard baked in. Keep the subject positions identical to the reference for existing head overlay registration. Output full portrait canvas with truly transparent background.”
