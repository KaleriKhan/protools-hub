import Link from "next/link";
import { navigation } from "@/data/navigation";

export default function DesktopNav() {
    return (
        <ul className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
                <li key={item.name}>
                    <Link
                        href={item.href}
                        className="text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-blue-600"
                    >
                        {item.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}