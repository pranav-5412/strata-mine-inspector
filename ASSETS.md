# Rock material asset

The separate exterior soil/gravel texture is saved at `public/materials/mine-ground-v1.png`. Its online visual references, integration details and exact built-in generation prompt are recorded in [Exterior material](docs/EXTERIOR_MATERIAL.md). The original pit-rock asset below is retained.

Saved project asset: `public/materials/weathered-rock-v1.png`.

Generated using the built-in image-generation tool on 16 October 2026. This is an artificial material reference, not imagery of an actual mine. Used through metre-space triplanar mapping on the terrain; no network request is needed after loading the locally hosted app.

Final generation prompt:

> Use case: photorealistic-natural. Asset type: seamless square albedo texture for a realistic interactive 3D open-pit mine. Generate a high-resolution flat, orthographic, tightly cropped photographic scan of exposed weathered sedimentary bedrock: grey-brown limestone and sandstone, subtle horizontal sediment bands, angular fractured slabs, fine fissures, mineral grain, beige dust trapped in cracks. Natural dry Indian quarry palette, muted warm gray, taupe and sandy brown. Entire frame is the rock material surface, no horizon, no perspective, no ground scene, no objects, no vegetation, no text, no border, no watermark. Uniform diffuse overcast lighting, no directional cast shadows, no shiny highlights, no ambient vignette, no lens blur. Seamless tileable edges; spatial detail evenly distributed; natural irregular cracks, never a brick wall or repetitive blocks. Material reference for physically shaded game geometry; the bitmap should be an albedo surface rather than a shaded landscape. Square composition at highest practical resolution.
