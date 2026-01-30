"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("Merci pour votre envoi !");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus(`Erreur: ${data.error || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/lucrun_web_photos/lucrun_main_image.jpg"
            alt="Running background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-wider">
            LUC RUN
          </h1>
          <p className="text-2xl md:text-3xl mb-2">Courir sans blessure</p>
          <p className="text-xl md:text-2xl mb-8">
            Coaching personnalisé pour tout coureur
          </p>

          {/* Social Media Links */}
          <div className="flex gap-6 justify-center mb-8">
            <a
              href="https://www.facebook.com/Luc.Run.Coach/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@lucruncoach"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/luc.run/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-white text-gray-900 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Découvrez le coaching
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
            >
              Réserver une séance
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Luc Run */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/lucrun_web_photos/Course femmes.avif"
                alt="Coaching de course"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Luc Run</h2>
              <h3 className="text-2xl font-semibold mb-6 text-gray-700">
                Coaching de course à pied certifié
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Luc Run propose un service de coaching de course personnalisé
                dédié à vous aider à atteindre vos objectifs, que vous soyez
                débutant ou que vous souhaitiez courir 5 km, 10 km, 20 km,
                semi-marathon, marathon, trail running ou ultra trail.
              </p>
              <Link
                href="/about"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Introduction au coaching de course
              </h2>
              <h3 className="text-2xl font-semibold mb-6 text-gray-700">
                La méthode ultime qui va changer votre vie
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Les programmes de coaching de course sont conçus pour vous aider
                à courir sans blessure, en travaillant sur votre forme, votre
                technique et votre endurance. Luc Run propose une formule
                mensuelle pour répondre à vos besoins et à votre emploi du temps
                chargé.
              </p>
              <Link
                href="/programs"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all"
              >
                En savoir plus
              </Link>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden order-1 md:order-2">
              <Image
                src="/lucrun_web_photos/Marathon dans la ville.avif"
                alt="Introduction au coaching"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Réserver une séance</h2>
          <p className="text-xl mb-4 leading-relaxed">
            Préparez-vous à conquérir vos objectifs de course les plus ambitieux
            en vous lançant dès maintenant avec Luc Run! Chaque séance est une
            chance de vous surpasser, de repousser vos limites et de révéler la
            puissance qui sommeille en vous.
          </p>
          <p className="text-xl mb-8 leading-relaxed">
            Avec un coaching dédié et une approche sur mesure, chaque foulée
            vous rapproche de vos objectifs.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Réserver
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
            Témoignages
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Antoine</h3>
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                &quot;Finisher sur la CCC grace à lui. 101Km 6300D+ Good job. A
                l&apos;écoute des coureurs et adapte le rythme des entraînements
                en prennant en compte l&apos;état physique&quot;
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Michel</h3>
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                &quot;Luc est un coach super sérieux, il sait s&apos;adapter et
                donne beaucoup de conseils. Ses deux priorités pas de blessures
                et prendre du plaisir en courant, je recommande Luc.&quot;
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Iza</h3>
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                &quot;Luc est une personne très sérieuse et scrupuleuse qui a à
                cœur d&apos;accompagner le coureur à progresser à son rythme
                avec 2 priorités : ne pas se blesser et avoir du plaisir dans la
                course à pied je recommande.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
            Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Ville:
                </h3>
                <p className="text-gray-600">95 Monsoult</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  E-mail:
                </h3>
                <a
                  href="mailto:luc.run.coach@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  luc.run.coach@gmail.com
                </a>
              </div>

              {/* Social Media Links */}
              <div className="flex gap-6 mt-8">
                <a
                  href="https://www.facebook.com/Luc.Run.Coach/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@lucruncoach"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/luc.run/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </button>
              {submitStatus && (
                <p
                  className={`text-center font-semibold ${
                    submitStatus.startsWith("Erreur")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {submitStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm mb-4">© 2024 par Luc Run.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <Link
              href="/mentions-legales"
              className="hover:text-white transition-colors"
            >
              Mentions légales
            </Link>
            <Link
              href="/politique-cookies"
              className="hover:text-white transition-colors"
            >
              Politique en matière de cookies
            </Link>
            <Link
              href="/politique-confidentialite"
              className="hover:text-white transition-colors"
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/conditions-utilisation"
              className="hover:text-white transition-colors"
            >
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
