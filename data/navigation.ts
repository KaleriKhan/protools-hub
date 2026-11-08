// data/navigation.ts  (replaces your existing file; `name` and `href` are kept for compatibility)
import { Home, Wrench, FolderTree, BookOpen, Mail, Info, type LucideIcon } from "lucide-react";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    group: "main" | "resources";
}

export const navigation: NavItem[] = [
    { name: "Home", href: "/", icon: Home, group: "main" },
    { name: "All Tools", href: "/tools", icon: Wrench, group: "main" },
    { name: "Categories", href: "/categories", icon: FolderTree, group: "main" },
    { name: "Blog", href: "/blog", icon: BookOpen, group: "resources" },
    { name: "About", href: "/about", icon: Info, group: "resources" },
    { name: "Contact", href: "/contact", icon: Mail, group: "resources" },
];

export const isActivePath = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

export const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
];