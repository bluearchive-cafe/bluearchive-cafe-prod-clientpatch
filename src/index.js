export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname.slice(1);
    const filename = pathname.split("/").pop();
    const allowedFiles = ["ExcelDB.db", "Excel.zip", "TableCatalog.bytes", "TableCatalog.hash"];

    if (allowedFiles.includes(filename)) {
      const obj = await env.CLIENTPATCH.get(pathname);
      if (obj) {
        return new Response(obj.body);
      }
    }

    return Response.redirect(
      "https://prod-clientpatch.bluearchiveyostar.com/" + pathname,
      302
    );
  },
};
