import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { products } from "@/lib/products";
import Link from "next/link";
//import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";

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

              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Elegance,
                <br />
                Crafted For You.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Discover beautifully crafted fascinators, headpieces and hair
                accessories designed to make every special occasion
                unforgettable.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="products"
                  className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800"
                >
                  Shop Collection
                </a>
              </div>
            </div>

           
         <div className="w-full lg:w-2/2">
           <HeroCarousel />
           </div>

          </div>
        </section>
        <CollectionShowcase />

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
<FeaturedProducts />

        {/* Videos */}
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

        {/* Order */}
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

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

      <Link
  href="/products"
  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg transition hover:from-pink-700 hover:to-purple-700"
>
  Explore
</Link>
    </div>
  );
}

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