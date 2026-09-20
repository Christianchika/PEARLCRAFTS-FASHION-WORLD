import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
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

              <h2 className="text-5xl font-bold leading-tight md:text-7xl">
                Elegance,
                <br />
                Crafted For You.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Discover beautifully crafted fascinators, headpieces and hair
                accessories designed to make every special occasion
                unforgettable.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#collections"
                  className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800"
                >
                  Shop Collection
                </a>

                <a
                  href="#order"
                  className="rounded-full border border-black px-8 py-4 font-semibold transition hover:bg-black hover:text-white"
                >
                  Custom Order
                </a>
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="flex min-h-[500px] items-center justify-center rounded-3xl bg-gray-200">
              <div className="text-center text-gray-500">
                <p className="text-6xl">👒</p>

                <p className="mt-4 font-semibold">
                  PEARLCRAFTS FASHION WORLD
                </p>

                <p className="text-sm">
                  Your hero image will go here
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Collections */}
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
                Explore our carefully crafted collection of elegant
                headpieces and accessories.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <CollectionCard
                icon="👒"
                title="Fascinators"
                description="Elegant fascinators designed for weddings, parties and special occasions."
              />

              <CollectionCard
                icon="💍"
                title="Bridal"
                description="Beautiful bridal headpieces and accessories for your special day."
              />

              <CollectionCard
                icon="✨"
                title="Hair Accessories"
                description="Stylish hairpieces and accessories to complete your look."
              />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-[#f8f5f1] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                  Our Work
                </p>

                <h2 className="mt-3 text-4xl font-bold">
                  Featured Designs
                </h2>
              </div>

              <a
                href="#collections"
                className="font-semibold underline"
              >
                View All Collections →
              </a>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <ProductCard
                name="Royal Pearl Fascinator"
                price="UGX 180,000"
              />

              <ProductCard
                name="Elegant Bridal Headpiece"
                price="UGX 250,000"
              />

              <ProductCard
                name="Classic Black Fascinator"
                price="UGX 150,000"
              />
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section id="videos" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Behind The Craft
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Our Videos
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Watch our latest designs, behind-the-scenes work and
                beautiful headpieces in action.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <VideoCard title="Fascinator Showcase" />

              <VideoCard title="Behind The Scenes" />

              <VideoCard title="Bridal Collection" />
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="bg-black px-6 py-24 text-white"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
              About PEARLCRAFTS
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Crafting Beauty With Passion
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              PEARLCRAFTS FASHION WORLD creates beautiful fascinators,
              headpieces and hair accessories for women who want to express
              elegance, confidence and individuality.
            </p>
          </div>
        </section>

        {/* Order CTA */}
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
              beautiful headpiece specially for you.
            </p>

            <button className="mt-8 rounded-full bg-black px-10 py-4 font-semibold text-white hover:bg-gray-800">
              Start Your Order
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* Collection Card */

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

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

      <a
        href="#order"
        className="mt-6 inline-block font-semibold underline"
      >
        Explore →
      </a>
    </div>
  );
}

/* Product Card */

function ProductCard({
  name,
  price,
}: {
  name: string;
  price: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="flex h-80 items-center justify-center bg-gray-200">
        <div className="text-center text-gray-500">
          <p className="text-5xl">👒</p>

          <p className="mt-3 text-sm">
            Product Image
          </p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold">
          {name}
        </h3>

        <p className="mt-2 font-semibold">
          {price}
        </p>

        <button className="mt-5 w-full rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800">
          View Product
        </button>
      </div>
    </div>
  );
}

/* Video Card */

function VideoCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-black">
      <div className="flex h-72 items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-black">
            ▶
          </div>

          <p className="mt-5 font-semibold">
            {title}
          </p>
        </div>
      </div>

      <div className="bg-white p-5">
        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          PEARLCRAFTS FASHION WORLD
        </p>
      </div>
    </div>
  );
}