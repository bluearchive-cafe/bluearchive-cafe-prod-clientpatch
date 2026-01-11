export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const filepath = url.pathname.slice(1);
        const pathparts = filepath.split("/");
        const filename = pathparts.at(-1);
        const version = pathparts.shift();
        const type = pathparts[0];
        const cookie = request.headers.get("Cookie") || ""
        const cookies = Object.fromEntries(
            cookie.split('; ').map(c => {
                const [key, value] = c.split('=');
                return [key, value];
            })
        );
        const TABLE_CATALOG = new Set([
            "TableCatalog.hash",
            "TableCatalog.bytes"
        ])
        const MEDIA_CATALOG = new Set([
            "MediaCatalog.hash",
            "MediaCatalog.bytes"
        ]);
        const ASSET_CATALOG = new Set([
            "BundlePackingInfo.hash",
            "BundlePackingInfo.bytes",
            "catalog_Android.hash",
            "catalog_Android.zip",
            "catalog_iOS.hash",
            "catalog_iOS.zip"
        ]);

        if (type === "TableBundles") {
            if (TABLE_CATALOG.has(filename)) {
                if (cookies.table === "cn") {
                    const object = await env.TABLEBUNDLES_CN_VOICE.get(filepath);
                    if (object) return new Response(object.body);
                }
            } else {
                const object = await env.TABLEBUNDLES_CN_VOICE.get(filepath);
                if (object) return new Response(object.body);
            }
        } else if (type === "MediaResources") {
            if (MEDIA_CATALOG.has(filename)) {
                if (cookies.voice === "cn") {
                    const key = [version, ...pathparts].join("/");
                    const object = await env.MEDIARESOURCES.get(key);
                    if (object) return new Response(object.body);
                }
            } else {
                const key = ["shared", ...pathparts].join("/");
                url.pathname = "/" + key;
                return env.ASSETS.fetch(new Request(url, request));
            }
        } else if (type === "Android_PatchPack" || type === "iOS_PatchPack") {
            if (ASSET_CATALOG.has(filename)) {
                if (cookies.asset === "cn") {
                    const key = [version, ...pathparts].join("/");
                    const object = await env.ASSETBUNDLES.get(key);
                    if (object) return new Response(object.body);
                }
            } else {
                const key = ["shared", ...pathparts].join("/");
                const object = await env.ASSETBUNDLES.get(key);
                if (object) return new Response(object.body);
            }
        }

        return Response.redirect("https://prod-clientpatch.bluearchiveyostar.com/" + filepath, 302);
    },
};
