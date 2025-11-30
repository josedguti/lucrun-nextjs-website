"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Programs() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Programmes
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-4 leading-relaxed">
            Luc Run propose des programmes personnalisés adaptés à votre niveau et à vos objectifs en course à pied, 
            que vous soyez débutant ou coureur chevronné, que ce soit pour un 5 km, 10 km, semi-marathon, marathon, 
            trail ou ultra-trail.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Chaque plan d&apos;entraînement est élaboré sur mesure pour maximiser votre potentiel tout en prenant en compte 
            vos préférences, vous propulsant ainsi vers vos sommets de manière personnelle et efficace. Joignez Luc Run 
            dans cette aventure où chaque foulée compte.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {/* Débutants */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Partenaires de jogging.avif"
                alt="Débutants"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Débutants</h3>
              <p className="text-gray-600">
                Relever le défi de vos objectifs de course à pied.
              </p>
            </div>
          </div>

          {/* De 5K au 10K */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Course femmes.avif"
                alt="De 5K au 10K"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">De 5K au 10K</h3>
              <p className="text-gray-600">
                Gagnez en vitesse, endurance et confiance sur chaque kilomètre.
              </p>
            </div>
          </div>

          {/* Semi-marathon */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Marathon dans la ville.avif"
                alt="Semi-marathon"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Semi-marathon</h3>
              <p className="text-gray-600">
                Préparez-vous à conquérir les 21 km avec confiance
              </p>
            </div>
          </div>

          {/* Spécial Marathon */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Les coureurs de marathon.avif"
                alt="Spécial Marathon"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Spécial Marathon</h3>
              <p className="text-gray-600">
                Dominez votre marathon avec détermination et préparation.
              </p>
            </div>
          </div>

          {/* Trail Running */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Jogging en couple.avif"
                alt="Trail Running"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Trail Running</h3>
              <p className="text-gray-600">
                Atteindre de nouveaux sommets avec le programme Trail Running.
              </p>
            </div>
          </div>

          {/* Ultra Trail Running */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <Image
                src="/lucrun_web_photos/Courir à l'extérieur.avif"
                alt="Ultra Trail Running"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ultra Trail Running</h3>
              <p className="text-gray-600">
                Dépassez vos limites mentales et physiques sur l&apos;ultra trail
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Formule mensuelle</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Un appel de connaissance</h3>
              <p className="text-gray-600">
                Comprendre vos besoins, établir une relation personnelle, et définir des objectifs spécifiques 
                adaptés à votre parcours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Première séance gratuite</h3>
              <p className="text-gray-600">
                Discuter de vos objectifs et de personnaliser votre plan d&apos;entraînement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Plan d&apos;entraînement personnalisé</h3>
              <p className="text-gray-600">
                Recevez chaque semaine des programmes spécifiques adaptés à votre niveau et à vos objectifs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Une plateforme dédiée</h3>
              <p className="text-gray-600">
                Suivre vos plans d&apos;entraînement, enregistrer vos progrès, et communiquer directement avec Luc Run.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Suivi hebdomadaire</h3>
              <p className="text-gray-600">
                Suivi régulier de vos progrès, avec ajustements en temps réel si nécessaire.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Conseils techniques personnalisés</h3>
              <p className="text-gray-600">
                Conseils techniques spécialisés pour améliorer votre posture, votre foulée et votre technique de respiration.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <section className="py-16 px-4 mb-20 bg-black rounded-2xl text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Réserver votre séance</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
            Prêt à dépasser vos limites? Réservez dès maintenant votre première séance gratuite et commencez 
            un entraînement personnalisé conçu pour vous propulser vers le succès.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-md text-lg font-semibold hover:bg-yellow-600 transition-all"
          >
            Réserver une séance
          </Link>
        </section>
      </main>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gray-50">
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
                <a href="mailto:luc.run.coach@gmail.com" className="text-yellow-600 hover:underline">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
