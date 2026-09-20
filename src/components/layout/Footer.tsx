import {
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">

        {/* Brand */}
        <div className="md:col-span-2">

          <h2 className="text-xl font-bold tracking-wide">
            PEARLCRAFTS
          </h2>

          <p className="text-[10px] tracking-[0.35em] text-gray-500">
            FASHION WORLD
          </p>

          <p className="mt-5 max-w-md leading-7 text-gray-600">
            Beautifully crafted fascinators, headpieces and hair
            accessories designed to make every occasion special.
          </p>

        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-gray-600">

            <a href="/">Home</a>
            <a href="#collections">Collections</a>
            <a href="#videos">Videos</a>
            <a href="#about">About Us</a>
            <a href="#order">Place an Order</a>

          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold">
            Contact
          </h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-gray-600">

            <div className="flex items-center gap-3">
              <Phone size={17} />
              <span>+256 XXX XXX XXX</span>
            </div>

            <div className="flex items-center gap-3">
              <MessageCircle size={17} />
              <span>WhatsApp</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={17} />
              <span>info@pearlcrafts.com</span>
            </div>

          </div>

          {/* Social media */}
         <div className="mt-6 flex gap-3">
  <a
    href="#"
    className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
    aria-label="Instagram"
  >
    Instagram
  </a>

  <a
    href="#"
    className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
    aria-label="Facebook"
  >
    Facebook
  </a>
</div>
        </div>

      </div>

      <div className="border-t">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-6 text-xs text-gray-500 md:flex-row">

          <p>
            © {new Date().getFullYear()} PEARLCRAFTS FASHION WORLD.
            All rights reserved.
          </p>

          <p>
            Handmade with care.
          </p>

        </div>

      </div>

    </footer>
  );
}