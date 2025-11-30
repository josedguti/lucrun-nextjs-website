"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-yellow-600 transition-colors tracking-wider"
            >
              LUC RUN
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/about"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                À propos
              </Link>
              <Link
                href="/programs"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Programmes
              </Link>
              <Link
                href="/contact"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </Link>
              <div className="flex space-x-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-yellow-600 hover:text-yellow-700 px-4 py-2 text-sm font-medium border border-yellow-600 rounded-md hover:bg-yellow-50 transition-all"
                    >
                      Tableau de bord
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-medium rounded-md transition-all"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-yellow-600 hover:text-yellow-700 px-4 py-2 text-sm font-medium border border-yellow-600 rounded-md hover:bg-yellow-50 transition-all"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md transition-all"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-yellow-600 focus:outline-none focus:text-blue-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/about"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                À propos
              </Link>
              <Link
                href="/programs"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                Programmes
              </Link>
              <Link
                href="/contact"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 px-3 py-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-yellow-600 hover:text-yellow-700 px-4 py-2 text-sm font-medium border border-yellow-600 rounded-md hover:bg-yellow-50 transition-all text-center"
                    >
                      Tableau de bord
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-medium rounded-md transition-all text-center"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-yellow-600 hover:text-yellow-700 px-4 py-2 text-sm font-medium border border-yellow-600 rounded-md hover:bg-yellow-50 transition-all text-center"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md transition-all text-center"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
