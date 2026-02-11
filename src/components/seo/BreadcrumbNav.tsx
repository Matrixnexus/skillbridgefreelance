import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SchemaMarkup from "./SchemaMarkup";

interface BreadcrumbNavProps {
  items: { label: string; href?: string }[];
}

const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  const schemaItems = items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.label,
    ...(item.href ? { item: `https://newrevolution.co.ke${item.href}` } : {}),
  }));

  return (
    <>
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: schemaItems,
        }}
      />
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          {items.map((item, i) => (
            <BreadcrumbItem key={i}>
              {i > 0 && <BreadcrumbSeparator />}
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default BreadcrumbNav;
