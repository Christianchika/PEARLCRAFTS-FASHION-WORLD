export type VideoEmbed =
  | { kind: "youtube"; src: string }
  | { kind: "vimeo"; src: string }
  | { kind: "tiktok"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

export function isValidVideoUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function getVideoEmbed(rawUrl: string): VideoEmbed {
  const url = rawUrl.trim();

  if (url.startsWith("/") && !url.startsWith("//")) {
    return { kind: "file", src: url };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "link", src: url };
  }

  const host = parsed.hostname.replace(/^(www|m)\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    if (/^[\w-]+$/.test(id)) {
      return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
    }
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id =
      parsed.searchParams.get("v") ??
      parsed.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
    if (id && /^[\w-]+$/.test(id)) {
      return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
    }
  }

  if (host === "vimeo.com") {
    const id = parsed.pathname.match(/^\/(\d+)/)?.[1];
    if (id) {
      return { kind: "vimeo", src: `https://player.vimeo.com/video/${id}` };
    }
  }

  if (host === "tiktok.com") {
    const id = parsed.pathname.match(/\/video\/(\d+)/)?.[1];
    if (id) {
      return { kind: "tiktok", src: `https://www.tiktok.com/embed/v2/${id}` };
    }
  }

  if (/\.(mp4|webm|mov|ogg)$/i.test(parsed.pathname)) {
    return { kind: "file", src: url };
  }

  return { kind: "link", src: url };
}
