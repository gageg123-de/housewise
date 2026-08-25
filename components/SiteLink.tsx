import type { AnchorHTMLAttributes, ReactNode } from "react";
import { routePath } from "@/lib/site-config";

type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export function SiteLink({ href, children, ...props }: SiteLinkProps) {
  return <a href={routePath(href)} {...props}>{children}</a>;
}
