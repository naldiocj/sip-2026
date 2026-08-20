"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { getBreadcrumbsForRoute } from "@/lib/navigation-config";
import { useEntityResolution } from "@/hooks/use-entity-resolution";

const dynamicRoutePatterns: Array<{ pattern: RegExp; entityType: string; labelPrefix?: string }> = [
  { pattern: /^\/processos\/([^/]+)$/, entityType: "processos", labelPrefix: "Processo" },
  { pattern: /^\/documentos\/([^/]+)$/, entityType: "documentos", labelPrefix: "Documento" },
  { pattern: /^\/pessoas\/([^/]+)$/, entityType: "pessoas", labelPrefix: "Pessoa" },
  { pattern: /^\/mandados\/([^/]+)$/, entityType: "mandados", labelPrefix: "Mandado" },
  { pattern: /^\/despachos\/([^/]+)$/, entityType: "despachos", labelPrefix: "Despacho" },
  { pattern: /^\/ocorrencias\/([^/]+)$/, entityType: "ocorrencias", labelPrefix: "Ocorrência" },
  { pattern: /^\/detidos\/([^/]+)$/, entityType: "detidos", labelPrefix: "Detido" },
];

export function BreadcrumbNav() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbsForRoute(pathname);

  // Check for dynamic routes that need entity resolution
  const dynamicMatch = dynamicRoutePatterns.find(({ pattern }) => pattern.test(pathname));
  const entityId = dynamicMatch ? pathname.match(dynamicMatch.pattern)?.[1] : undefined;
  const entityType = dynamicMatch?.entityType;
  const labelPrefix = dynamicMatch?.labelPrefix;

  const { data: entity } = useEntityResolution(entityType ?? "", entityId);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isDynamicRoute = dynamicMatch && index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={crumb.route}>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>
                  {isDynamicRoute && entity
                    ? `${labelPrefix} ${entity.label}`
                    : isDynamicRoute && entityId
                    ? `${labelPrefix} ${entityId}`
                    : crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.route}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
