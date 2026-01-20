export default {
    async fetch(request, env, ctx) {
        const key = new URL(request.url).pathname.slice(1);
        const object = await env.CLIENTPATCH.get(key);
        if (object) return new Response(object.body);
        key = key.replace("VOC_CN/", "");
        return Response.redirect(`https://prod-clientpatch.bluearchiveyostar.com/${key}`, 302);
    },
};
