import { useState, useEffect } from "react";
import { Instagram, ExternalLink, Heart, MessageCircle, Play } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";

type InstagramPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [username, setUsername] = useState("guardiantech_oficial");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("instagram-feed");

        if (fnError || !data?.success) {
          console.error("Instagram feed error:", fnError || data?.error);
          setError(true);
          return;
        }

        setPosts(data.posts || []);
        if (data.username) setUsername(data.username);
      } catch (err) {
        console.error("Instagram fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (error || (!loading && posts.length === 0)) {
    return null; // Don't show section if no posts or error
  }

  return (
    <section className="py-16 bg-solitude-blue">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-white text-base-color text-xs font-semibold uppercase px-6 py-2 rounded-full mb-4 font-alt">
            <Instagram size={14} />
            Instagram
          </span>
          <h3 className="text-2xl md:text-3xl font-alt font-semibold text-dark-gray">
            Acompanhe nosso dia a dia
          </h3>
          <p className="text-medium-gray mt-2">
            Siga{" "}
            <a
              href={`https://www.instagram.com/${username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-color font-semibold hover:underline"
            >
              @{username}
            </a>{" "}
            para novidades em tempo real
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <AnimatedSection key={post.id} delay={i * 0.08}>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow"
                >
                  <img
                    src={post.media_type === "VIDEO" ? post.thumbnail_url || post.media_url : post.media_url}
                    alt={post.caption?.slice(0, 80) || "Post do Instagram"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Video indicator */}
                  {post.media_type === "VIDEO" && (
                    <div className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-dark-slate-blue/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                    <Instagram size={28} className="text-white" />
                    {post.caption && (
                      <p className="text-white/90 text-xs text-center line-clamp-3 max-w-[200px]">
                        {post.caption}
                      </p>
                    )}
                    <span className="text-white/70 text-[10px] flex items-center gap-1 mt-1">
                      <ExternalLink size={10} /> Ver no Instagram
                    </span>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        )}

        <AnimatedSection delay={0.3} className="text-center mt-8">
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-dark-gray text-white px-6 py-3 rounded-full font-medium hover:bg-dark-gray/90 transition text-sm"
          >
            <Instagram size={16} />
            Seguir no Instagram
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default InstagramFeed;
