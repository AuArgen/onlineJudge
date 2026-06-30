/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["react-markdown", "remark-gfm", "remark-parse", "unified", "bail", "is-plain-obj", "trough", "vfile", "unist-util-stringify-position", "micromark", "decode-named-character-reference", "character-entities", "mdast-util-from-markdown", "mdast-util-to-string", "micromark-util-combine-extensions", "micromark-util-chunked", "micromark-util-character", "micromark-util-encode", "micromark-util-html-tag-name", "micromark-util-normalize-identifier", "micromark-util-resolve-all", "micromark-util-sanitize-uri", "micromark-util-subtokenize", "micromark-util-symbol", "micromark-util-types", "unist-util-visit", "unist-util-is", "hast-util-to-jsx-runtime", "hast-util-whitespace", "property-information", "hastscript", "space-separated-tokens", "comma-separated-tokens"],
  experimental: {},
};

export default nextConfig;
