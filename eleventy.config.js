module.exports = function (eleventyConfig) {
  // copied through untouched
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/video": "video" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // money, always two decimals or a plain "From $X"
  eleventyConfig.addFilter("price", (v) => (v == null || v === "" ? "" : String(v)));

  // plain text for the chatbot knowledge file: no tags, no HTML entities
  const decode = (s) =>
    String(s || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  eleventyConfig.addFilter("plain", decode);

  // only promos flagged live
  eleventyConfig.addFilter("live", (arr) => (arr || []).filter((x) => x.live !== false));

  eleventyConfig.addFilter("buildDate", () =>
    new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC"
  );

  // Sort by the Order field the CMS exposes, highest first. Relying on
  // filenames or file dates broke as soon as a post was renamed.
  eleventyConfig.addCollection("posts", (c) =>
    c.getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => (Number(b.data.order) || 0) - (Number(a.data.order) || 0))
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
