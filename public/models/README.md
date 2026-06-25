# Private models — keep your `.vrm` here

Place your avatar model at:

```
public/models/private/rui-local.vrm
```

**The entire `public/models/private/` folder is gitignored.** No avatar model is
committed to this repository. You must supply your own original/licensed `.vrm`.

> ⚠️ Do **not** add official Project SEKAI models, voices, or any copyrighted
> assets to this repository. This is a private project and must remain free of
> third-party copyrighted material. Use official material only as **reference**
> (see `docs/research/legal-notes.md`).

The path is configurable via `NEXT_PUBLIC_VRM_PATH` in `.env.local`
(defaults to `/models/private/rui-local.vrm`). If the file is missing, the app
shows a friendly placeholder instead of crashing.

You can create your own original VRM with **VRoid Studio** or **Blender + the
VRM add-on** (links in `docs/research/sources.md`).
