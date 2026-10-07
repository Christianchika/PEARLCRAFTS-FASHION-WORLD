import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    name: "Fascinators",
    description:
      "Elegant fascinators designed to complete your special occasion look.",
    image: "/products/royal-pearl-fascinator.jpg",
    href: "/products?category=Fascinators",
  },
  {
    name: "Bridal",
    description:
      "Beautiful bridal headpieces and accessories for your unforgettable day.",
    image: "/products/elegant-bridal-headpiece.jpg",
    href: "/products?category=Bridal",
  },
  {
    name: "Hair Accessories",
    description:
      "Stylish pieces designed to add beauty and personality to your hairstyle.",
    image: "/products/classic-black-fascinator.jpg",
    href: "/products?category=Hair%20Accessories",
  },
];

export default function CollectionShowcase() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-600">
            Explore Our Collection
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#35102f] sm:text-4xl">
            Find Your Perfect Style
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover beautifully crafted pieces for weddings,
            celebrations, formal occasions and everyday elegance.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.name}
              href={collection.href}
              className="group overflow-hidden rounded-[2rem] bg-[#fff8fc] shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#35102f]/80 via-[#35102f]/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-200">
                    Collection
                  </p>

                  <h3 className="mt-2 text-3xl font-extrabold">
                    {collection.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/90">
                    {collection.description}
                  </p>

                  <span className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-purple-700 transition group-hover:bg-pink-600 group-hover:text-white">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex rounded-full border-2 border-purple-600 px-8 py-3 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}