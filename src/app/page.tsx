
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import VideoPlayer from "@/components/VideoPlayer";
import { prisma } from "@/lib/prisma";

const collections = [
  {
    icon: "👒",
    title: "Fascinators",
    description:
      "Elegant fascinators designed for weddings, parties and special occasions.",
  },
  {
    icon: "🎩",
    title: "Boater Hats",
    description:
      "Stylish boater hats for a distinctive, sophisticated look.",
  },
  {
    icon: "✨",
    title: "Auto Gele",
    description:
      "Beautiful auto gele styles for celebrations, weddings and special occasions.",
  },
  {
    icon: "💎",
    title: "Hair Accessories",
    description:
      "Stylish hairpieces and accessories to complete your look.",
  },
];

function isBehindTheScenes(video: {
  title: string;
  description: string;
}) {
  return /behind[\s-]*the[\s-]*scenes?|making|crafting|workshop|production|process/i.test(
    `${video.title} ${video.description}`
  );
}

export default async function Home() {
  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const behindTheScenesVideos = videos
    .filter(isBehindTheScenes)
    .slice(0, 3);

  const otherVideos = videos.filter(
    (video) => !isBehindTheScenes(video)
  );

  const featuredVideos = (
    otherVideos.length > 0 ? otherVideos : videos
  ).slice(0, 3);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-[#f8f5f1]">
          <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Handmade Elegance
              </p>

              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Elegance,
                <br />
                Crafted For You.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Discover beautifully crafted fascinators, boater hats,
                auto gele and hair accessories designed to make every
                special occasion unforgettable.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800"
                >
                  Shop Collection
                </Link>
              </div>
            </div>

            <div className="w-full">
              <HeroCarousel />
            </div>
          </div>
        </section>

        <CollectionShowcase />

        {/* Product Collections */}
        <section id="collections" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Explore
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Our Collections
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Discover our carefully crafted fashion pieces,
                designed to bring elegance to every occasion.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.title}
                  {...collection}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Main Videos */}
        <section id="videos" className="bg-[#f8f5f1] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Discover Our Designs
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Our Videos
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Explore our designs, fashion inspiration and beautiful
                headpieces in action.
              </p>
            </div>

            {featuredVideos.length > 0 ? (
              <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredVideos.map((video) => (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <VideoPlayer
                      url={video.videoUrl}
                      title={video.title}
                    />

                    <div className="p-6">
                      <h3 className="text-xl font-bold">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="mt-3 leading-7 text-gray-600">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h3 className="text-xl font-bold">
                  Our videos are coming soon
                </h3>
                <p className="mt-3 text-gray-600">
                  We are preparing videos to showcase our designs
                  and creative work.
                </p>
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/videos"
                className="inline-block rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800"
              >
                View All Videos
              </Link>
            </div>
          </div>
        </section>

        {/* Behind The Scenes */}
        <section id="behind-the-scenes" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Meet The Craft
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Behind the Scenes
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Get a closer look at the creativity, craftsmanship
                and work that go into bringing every PEARLCRAFTS
                design to life.
              </p>
            </div>

            {behindTheScenesVideos.length > 0 ? (
              <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {behindTheScenesVideos.map((video) => (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                  >
                    <VideoPlayer
                      url={video.videoUrl}
                      title={video.title}
                    />

                    <div className="p-6">
                      <h3 className="text-xl font-bold">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="mt-3 leading-7 text-gray-600">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl bg-[#f8f5f1] px-8 py-12 text-center">
                <div className="text-5xl">🎬</div>
                <h3 className="mt-5 text-2xl font-bold">
                  The Art Behind Every Creation
                </h3>
                <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-600">
                  Behind-the-scenes videos will appear here as we
                  share our design process, creative techniques
                  and workshop moments.
                </p>
                <Link
                  href="/videos"
                  className="mt-6 inline-block rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Explore Our Videos
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-black px-6 py-24 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
              About PEARLCRAFTS
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Crafting Beauty With Passion
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              PEARLCRAFTS FASHION WORLD creates beautiful fascinators,
              boater hats, auto gele and hair accessories for women
              who want to express elegance, confidence and individuality.
            </p>
          </div>
        </section>

        {/* Custom Order */}
        <section id="order" className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#f8f5f1] px-8 py-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
              Custom Designs
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Have Something Special In Mind?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Tell us what you are looking for and we can create a
              beautiful piece specially for you.
            </p>

            <Link
              href="/custom-order"
              className="mt-8 inline-block rounded-full bg-gradient-to-r from-pink-600 via-fuchsia-500 to-purple-600 px-10 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              Start Your Order
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function CollectionCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f5f1] text-3xl">
        {icon}
      </div>

      <h3 className="mt-6 text-2xl font-bold">{title}</h3>

      <p className="mt-3 leading-7 text-gray-600">{description}</p>

      <Link
        href={`/products?category=${encodeURIComponent(title)}`}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:from-pink-700 hover:to-purple-700"
      >
        Explore {title}
      </Link>
    </div>
  );
}
