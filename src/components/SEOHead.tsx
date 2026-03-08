import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  path?: string;
}

const BASE_URL = "https://local-event-ai.lovable.app";
const SITE_NAME = "TinyTinyEvents";

export function SEOHead({ title, description, path }: SEOHeadProps) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (name.startsWith("og:")) {
          el.setAttribute("property", name);
        } else {
          el.setAttribute("name", name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description);
    }
    setMeta("og:title", `${title} | ${SITE_NAME}`);
    setMeta("og:type", "website");
    if (path) {
      setMeta("og:url", `${BASE_URL}${path}`);
    }

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, path]);

  return null;
}
