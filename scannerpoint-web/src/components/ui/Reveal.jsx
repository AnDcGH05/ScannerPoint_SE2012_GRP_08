import { useEffect, useRef, useState } from 'react';

// Fade-up on scroll: 350ms, with `index` giving a 60ms stagger. CSS lives in theme.css.
export default function Reveal({ index = 0, as: Tag = 'div', className = '', children, ...rest }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setShown(true); io.disconnect(); }
        }, { threshold: 0.12 });
        io.observe(ref.current);
        return () => io.disconnect();
    }, []);

    return (
        <Tag ref={ref} className={`reveal${shown ? ' is-in' : ''} ${className}`}
             style={{ '--reveal-delay': `${index * 60}ms` }} {...rest}>
            {children}
        </Tag>
    );
}
