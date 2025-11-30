"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function About() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
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
      <section className="relative py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            À propos de Luc Run
          </h1>
        </div>
      </section>

      {/* Main About Section with Image */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/lucrun_web_photos/52861350_403191576922891_522896733391290368_n.avif"
                alt="Luc Run Coach"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Luc Run</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Luc Run est un professionnel certifié et expérimenté dans le domaine de la course à pied. 
                Il a une expérience de course personnelle et une formation approfondie en matière de prévention 
                des blessures et d&apos;optimisation des performances. Il travaille en étroite collaboration avec 
                ses clients pour élaborer des programmes d&apos;entraînement personnalisés qui répondent à leurs besoins 
                et à leurs objectifs de course. Luc Run est passionné par la course et il se consacrent à aider 
                ses clients à courir plus vite, plus loin et sans blessure.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all"
                >
                  Réserver une séance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            La méthode ultime qui va changer votre vie
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            La méthode s&apos;appuie sur une approche globale de la course à pied, prenant en compte votre 
            condition physique, votre alimentation et votre mode de vie. Luc Run travaille avec vous pour 
            élaborer un plan d&apos;entraînement adapté à votre niveau, à vos besoins et à vos obligations de 
            vie familiale et professionnelle. Être à votre écoute pour répondre à toutes vos questions et 
            vous donner des conseils personnalisés est la priorité.
          </p>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
            Pourquoi choisir Luc Run ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Convient à tous les niveaux
              </h3>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Formules d&apos;entraînement flexibles
              </h3>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Entretiens individuels avec Luc Run
              </h3>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Techniques avancées pour améliorer votre performance
              </h3>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Des résultats concrets à la clé
              </h3>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coaching certifié
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Couple Running Image Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/lucrun_web_photos/Jogging en couple.avif"
              alt="Couple sur une course"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">Contact</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Ville:</h3>
                <p className="text-gray-600">95 Monsoult</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">E-mail:</h3>
                <a href="mailto:luc.run.coach@gmail.com" className="text-blue-600 hover:underline">
                  luc.run.coach@gmail.com
                </a>
              </div>
              
              {/* Social Media Links */}
              <div className="flex gap-6 mt-8">
                <a href="https://www.facebook.com/Luc.Run.Coach/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@lucruncoach" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-600 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/luc.run/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                <p className={`text-center font-semibold ${
                  submitStatus.startsWith("Erreur") ? "text-red-600" : "text-green-600"
                }`}>
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
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/politique-cookies" className="hover:text-white transition-colors">Politique en matière de cookies</Link>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="/conditions-utilisation" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
