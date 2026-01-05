export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const filepath = url.pathname.slice(1);
    const pathparts = filepath.split("/");
    const filename = pathparts.at(-1);
    const version = pathparts.shift();
    const resourceType = pathparts[0];
    const isCnVoice = url.hostname === "cn-voice.prod-clientpatch.bluearchive.cafe";
    const ASSET_BUNDLES = new Set(["iOS_PatchPack", "Android_PatchPack"]);
    const MEDIA_CATALOG = new Set(["MediaCatalog.hash", "MediaCatalog.bytes"]);
    const ASSET_CATALOG = new Set([
      "BundlePackingInfo.hash",
      "BundlePackingInfo.bytes",
      "catalog_Android.hash",
      "catalog_Android.zip",
      "catalog_iOS.hash",
      "catalog_iOS.zip"
    ]);

    if (resourceType === "TableBundles") {
      const object = await (isCnVoice ? env.TABLEBUNDLES_CN_VOICE : env.TABLEBUNDLES).get(filepath);
      if (object) return new Response(object.body, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    if (ASSET_BUNDLES.has(resourceType)) {
      const key = [ASSET_CATALOG.has(filename) ? version : "shared", ...pathparts].join("/");
      const object = await env.ASSETBUNDLES.get(key);
      if (object) return new Response(object.body, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    if (resourceType === "MediaResources" && isCnVoice) {
      const key = [MEDIA_CATALOG.has(filename) ? version : "shared", ...pathparts].join("/");
      const object = await env.MEDIARESOURCES.get(key);
      if (object) return new Response(object.body, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    return Response.redirect("https://prod-clientpatch.bluearchiveyostar.com/" + filepath, 302);
  },
};
