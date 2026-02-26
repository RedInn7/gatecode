import React from "react";

const COLORS = [
  "#4285F4", "#EA4335", "#FBBC05", "#34A853", // Google palette
  "#FF6900", "#FCB900", "#7BDCB5", "#00D084",
  "#8ED1FC", "#0693E3", "#ABB8C3", "#EB144C",
  "#F78DA7", "#9900EF", "#FF5722", "#795548",
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.split(/[\s-]+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type CompanyLogoProps = {
  slug: string;
  name: string;
  size?: number;
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({ slug, name, size = 32 }) => {
  const color = COLORS[hashSlug(slug) % COLORS.length];
  const initials = getInitials(name);
  const fontSize = size * 0.4;

  return (
    <div
      className="flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize,
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
};

export default CompanyLogo;
