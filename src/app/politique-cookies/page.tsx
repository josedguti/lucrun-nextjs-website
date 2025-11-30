"use client";

import Link from "next/link";

export default function PolitiqueCookies() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Politique de confidentialité en matière de cookies
          </h1>
        </div>

        {/* Cookie Policy Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Un cookie est un petit fichier constitué de lettres et de chiffres et téléchargé sur votre ordinateur lorsque 
              vous accédez à certains sites web. Les cookies sont utilisés pour améliorer l&apos;expérience de navigation de 
              l&apos;utilisateur. Chez Luc Run, nous utilisons des cookies pour personnaliser votre expérience, vous offrir des 
              fonctionnalités sur mesure et améliorer la convivialité de notre site web. Nous ne collectons aucune donnée 
              personnelle via les cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Pourquoi utilisons-nous des cookies ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous utilisons des cookies pour plusieurs raisons. Tout d&apos;abord, nous les utilisons pour personnaliser votre 
              expérience sur notre site web. Les cookies nous permettent de vous montrer des informations pertinentes en fonction 
              de votre historique de navigation et de vos préférences. De plus, nous utilisons des cookies pour mesurer la 
              performance de notre site web et pour améliorer ses fonctionnalités. Enfin, nous utilisons des cookies pour garantir 
              la sécurité de nos services en ligne.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Quels cookies utilisons-nous ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Chez Luc Run, nous utilisons différents types de cookies pour différentes fonctions, notamment les cookies de session, 
              les cookies de performance et les cookies de publicité. Pour plus d&apos;informations sur les cookies que nous utilisons, 
              veuillez consulter notre politique de confidentialité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Comment gérer les cookies ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Vous pouvez gérer vos préférences en matière de cookies dans les paramètres de votre navigateur. Vous pouvez bloquer 
              ou supprimer les cookies à tout moment, mais cela pourrait affecter la fonctionnalité de notre site web. Pour plus 
              d&apos;informations sur la gestion des cookies, consultez les instructions de votre navigateur ou visitez{" "}
              <a href="https://www.allaboutcookies.org/fr/" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">
                https://www.allaboutcookies.org/fr/
              </a>.
            </p>
          </section>
        </div>

        {/* Contact Section */}
        <section className="py-12 px-4 bg-gray-50 rounded-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Contact</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Ville:</h3>
              <p className="text-gray-600">95 Monsoult</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">E-mail:</h3>
              <a href="mailto:luc.run.coach@gmail.com" className="text-yellow-600 hover:underline">
                luc.run.coach@gmail.com
              </a>
            </div>
            
            {/* Social Media Links */}
            <div className="flex gap-6 justify-center mt-8">
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
        </section>
      </main>

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

