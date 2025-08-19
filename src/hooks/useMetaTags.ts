import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export function useMetaTags({
  title,
  description,
  image,
  url,
  type = "website",
}: MetaTagsProps) {
  useEffect(() => {
    // Atualizar título da página
    document.title = title;

    // Meta tags básicas
    updateMetaTag("name", "description", description);
    updateMetaTag("property", "og:title", title);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:type", type);

    if (url) {
      updateMetaTag("property", "og:url", url);
    }

    if (image) {
      updateMetaTag("property", "og:image", image);
      updateMetaTag("property", "og:image:width", "1200");
      updateMetaTag("property", "og:image:height", "630");
    }

    // Twitter Card
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", title);
    updateMetaTag("name", "twitter:description", description);
    if (image) {
      updateMetaTag("name", "twitter:image", image);
    }

    // Limpar meta tags quando componente desmontar
    return () => {
      // Restaurar título original se necessário
      document.title = "MemesAo - Os Melhores Memes";
    };
  }, [title, description, image, url, type]);
}

function updateMetaTag(
  attribute: "name" | "property",
  value: string,
  content: string
) {
  let meta = document.querySelector(
    `meta[${attribute}="${value}"]`
  ) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, value);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}
