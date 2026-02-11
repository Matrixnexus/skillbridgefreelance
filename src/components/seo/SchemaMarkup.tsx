import { useEffect } from "react";

interface SchemaMarkupProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

const SchemaMarkup = ({ schema }: SchemaMarkupProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

export default SchemaMarkup;
