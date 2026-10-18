// import Link from "next/link";
// import { SITE_CONFIG } from "@/constants/site";

// export default function Logo() {
//     return (
//         <Link href="/" className="flex items-center">
//             <span className="text-2xl font-bold tracking-tight">
//                 {SITE_CONFIG.name}
//             </span>
//         </Link>
//     );
// };

import Link from "next/link";
import Image from "next/image";

export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 group">
            <Image 
                src="/logo.png" 
                alt="MyProToolsHub Logo" 
                width={140} 
                height={40} 
                priority 
                className="h-9 w-auto object-contain"
            />
        </Link>
    );
}