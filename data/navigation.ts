export type NavItem = {
    name: string;
    href: string;
};

export const navigation: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: "Categories", href: "/categories" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
];