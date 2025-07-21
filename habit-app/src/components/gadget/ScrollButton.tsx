import { useEffect, useState } from 'react';
import { ArrowUpFromDot, ArrowDownToDot } from 'lucide-react';

export const ScrollButton = () => {
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [visible, setVisible] = useState(false);

    const toggleScroll = () => {
        if (isAtBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            const atTop = scrollTop === 0;
            const atBottom = scrollTop + windowHeight >= docHeight - 1;

            setIsAtBottom(atBottom);
            setVisible(scrollTop > 300 || atTop || atBottom);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={toggleScroll}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-foreground)';
            }}
            className="btn p-3 rounded-full"
        >
            {isAtBottom ? <ArrowUpFromDot size={20} /> : <ArrowDownToDot size={20} />}
        </button>
    );
};
