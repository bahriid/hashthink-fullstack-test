import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" />
            <rect x="11.5" y="1" width="7.5" height="7.5" rx="1.5" />
            <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" />
            <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" />
        </svg>
    );
}
