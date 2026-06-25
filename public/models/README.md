# Private models — keep your `.vrm` here

Place your avatar model at:

```
public/models/rui-local.vrm
```

**This file is intentionally gitignored.** No avatar model is committed to this
repository. You must supply your own original/licensed `.vrm` file.

> ⚠️ Do **not** add official Project SEKAI models, voices, or any copyrighted
> assets to this repository. This is a private project and must remain free of
> third-party copyrighted material.

The path is configurable via `NEXT_PUBLIC_VRM_PATH` in `.env.local`
(defaults to `/models/rui-local.vrm`). If the file is missing, the app shows a
friendly placeholder instead of crashing.

You can create or find VRM models with tools such as VRoid Studio (export your
own original character).
