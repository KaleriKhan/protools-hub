import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";

export default function Logo() {
    return (
        <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">
                {SITE_CONFIG.name}
            </span>
        </Link>
    );
};