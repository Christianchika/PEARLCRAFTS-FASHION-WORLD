import { getVideoEmbed } from "@/lib/video";

export default function VideoPlayer({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const embed = getVideoEmbed(url);

  if (embed.kind === "youtube" || embed.kind === "vimeo") {
    return (
      <iframe
        src={embed.src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (embed.kind === "tiktok") {
    return (
      <div className="flex justify-center bg-black">
        <iframe
          src={embed.src}
          title={title}
          loading="lazy"
          allow="encrypted-media; fullscreen"
          allowFullScreen
          className="h-[740px] w-full max-w-[340px] border-0"
        />
      </div>
    );
  }

  if (embed.kind === "file") {
    return (
      <video
        src={embed.src}
        controls
        preload="metadata"
        className="aspect-video w-full bg-black"
      />
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#35102f] via-[#7c3aed] to-[#ec1976]">
      <a
        href={embed.src}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white/20 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/30"
      >
        ▶ Watch video
      </a>
    </div>
  );
}
