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
        const ASSET_CATALOG = new Set([
            "BundlePackingInfo.hash",
            "BundlePackingInfo.bytes",
            "catalog_Android.hash",
            "catalog_Android.zip",
            "catalog_iOS.hash",
            "catalog_iOS.zip"
        ]);
        const MEDIA_CATALOG = new Set([
            "MediaCatalog.hash",
            "MediaCatalog.bytes"
        ]);

        if (cookies.dev === "true") {
            const object = await env.CLIENTPATCH.get(filepath);
            if (object) return new Response(object.body);
            return Response.redirect("https://prod-clientpatch.bluearchiveyostar.com/" + filepath, 302);
        }

        if (type === "TableBundles" && cookies.table === "cn") {
            const object = await (cookies.voice === "cn" ? env.TABLEBUNDLES_CN_VOICE : env.TABLEBUNDLES).get(filepath);
            if (object) return new Response(object.body);
        } else if ((type === "Android_PatchPack" || type === "iOS_PatchPack") && cookies.asset === "cn") {
            const key = [ASSET_CATALOG.has(filename) ? version : "shared", ...pathparts].join("/");
            const object = await env.ASSETBUNDLES.get(key);
            if (object) return new Response(object.body);
        } else if (type === "MediaResources" && cookies.voice === "cn") {
            const key = [MEDIA_CATALOG.has(filename) ? version : "shared", ...pathparts].join("/");
            const object = await env.MEDIARESOURCES.get(key);
            if (object) return new Response(object.body);
        }

        return Response.redirect("https://prod-clientpatch.bluearchiveyostar.com/" + filepath, 302);
    },
};
