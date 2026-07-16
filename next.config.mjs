/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost").hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public/signed URLs
      { protocol: "https", hostname: supabaseHost },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
