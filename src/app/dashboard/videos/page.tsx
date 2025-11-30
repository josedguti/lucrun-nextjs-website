"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: "technique" | "training" | "nutrition" | "recovery";
}

export default function Videos() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Check if user is approved (is_active)
  useEffect(() => {
    async function checkApproval() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Check if user is admin
        const isAdmin = user.email === "luc.run.coach@gmail.com";

        // For non-admin users, check if they are approved (is_active)
        if (!isAdmin) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_active")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }

          // Redirect if not approved
          if (!profile?.is_active) {
            router.push("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking approval:", error);
      } finally {
        setLoading(false);
      }
    }

    checkApproval();
  }, [router, supabase]);

  const videos: Video[] = [
    {
      id: "1",
      title: "Les fondamentaux de la foulée",
      description:
        "Apprenez les éléments essentiels d&apos;une foulée efficace, y compris la posture, la cadence et les schémas d&apos;appui. Parfait pour les débutants et les coureurs expérimentés souhaitant améliorer leur technique.",
      duration: "12:34",
      thumbnail:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
      category: "technique",
    },
    {
      id: "2",
      title: "Plan d&apos;entraînement 5KM",
      description:
        "Suivez cette séance d&apos;entraînement par intervalles structurée, conçue pour améliorer votre temps sur 5KM. Comprend l'échauffement, les intervalles et la phase de récupération.",
      duration: "25:18",
      thumbnail:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop",
      category: "training",
    },
    {
      id: "3",
      title: "Guide nutritionnel avant la course",
      description:
        "Découvrez quoi manger avant vos courses pour des performances optimales. Apprenez le timing, les portions et les meilleurs aliments pour différents types d&apos;entraînement.",
      duration: "8:42",
      thumbnail:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop",
      category: "nutrition",
    },
    {
      id: "4",
      title: "Routine de récupération après course",
      description:
        "Techniques essentielles d'étirement et de récupération pour prévenir les blessures et améliorer les performances. Comprend des étirements dynamiques, l'utilisation du rouleau de massage et des exercices de respiration.",
      duration: "15:27",
      thumbnail:
        "https://images.unsplash.com/photo-1506629905965-c319a2dbaa5e?w=400&h=225&fit=crop",
      category: "recovery",
    },
    {
      id: "5",
      title: "Technique de course en côte",
      description:
        "Maîtrisez l'art de la course en côte avec une technique appropriée pour les montées et les descentes. Apprenez à maintenir votre rythme et à prévenir la fatigue sur un terrain difficile.",
      duration: "18:55",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
      category: "technique",
    },
    {
      id: "6",
      title: "Stratégies mentales pour le marathon",
      description:
        "Développez votre résistance mentale et vos stratégies pour la course longue distance. Apprenez les techniques de visualisation, la gestion de la douleur et comment rester motivé pendant l'entraînement.",
      duration: "22:13",
      thumbnail:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=225&fit=crop",
      category: "training",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technique":
        return "bg-blue-100 text-blue-800";
      case "training":
        return "bg-green-100 text-green-800";
      case "nutrition":
        return "bg-orange-100 text-orange-800";
      case "recovery":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "technique":
        return "Technique";
      case "training":
        return "Entraînement";
      case "nutrition":
        return "Nutrition";
      case "recovery":
        return "Récupération";
      default:
        return "Général";
    }
  };

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(videoId);
    // Here you would typically open a video player modal or navigate to a video player page
    alert(`Lecture de la vidéo : ${videos.find((v) => v.id === videoId)?.title}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vidéos d&apos;entraînement
          </h1>
          <p className="text-lg text-gray-600">
            Regardez des vidéos dirigées par des experts pour améliorer votre technique de course, votre entraînement et vos performances.
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Video Thumbnail */}
              <div className="relative group">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handlePlayVideo(video.id)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform hover:scale-110 transition-all duration-300"
                  >
                    <svg
                      className="w-8 h-8 text-blue-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      video.category
                    )}`}
                  >
                    {getCategoryLabel(video.category)}
                  </span>
                </div>
              </div>

              {/* Video Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {video.description}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => handlePlayVideo(video.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Regarder la vidéo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
