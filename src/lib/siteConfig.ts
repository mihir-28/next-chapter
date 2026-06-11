export const siteConfig = {
    name: "Next Chapter",
    title: "Next Chapter | ARC Tracker",
    description:
        "Advance Reader Copy (ARC) tracker for book reviewers to manage reading progress and review deadlines efficiently.",
    url: "https://nextchapter-app.mihirnagda.in",
    locale: "en_US",
    keywords: [
        "Next Chapter",
        "ARC Tracker",
        "Advance Reader Copy tracker",
        "book review tracker",
        "reading progress tracker",
        "book organizer",
        "book blogger tools",
        "ARC tracking web app",
        "NetGalley tracker",
        "Edelweiss tracker",
        "review deadline manager",
        "reading planner",
        "Mihir Nagda",
        "Next.js",
        "TypeScript",
        "React",
        "Tailwind CSS",
        "JavaScript",
        "book reviewer app",
        "reading dashboard",
        "PWA book tracker"
    ],
    email: "mihirnagda28@gmail.com",
    location: "Mumbai, India",
    socialLinks: {
        github: "https://github.com/mihir-28",
        linkedin: "https://www.linkedin.com/in/mihir-an28/",
        x: "https://x.com/kyayaar_mihir",
        instagram: "https://instagram.com/kyayaar.mihir",
        website: "https://mihirnagda.in",
    },
    images: {
        og: "/og.png",
    },
} as const;

export const socialProfiles = Object.values(siteConfig.socialLinks).filter(Boolean) as string[];
