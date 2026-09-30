import { useEffect, useRef, useState } from 'react';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Counts from 0 to `value` once the number scrolls into view.
export default function CountUp({ value, duration = 900, decimals = 0, prefix = '', suffix = '' }) {
    const target = Number(value) || 0;
    const [shown, setShown] = useState(reduced() ? target : 0);
    const ref = useRef(null);

    useEffect(() => {
        if (reduced()) { setShown(target); return; }
        let raf;
        const run = () => {
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                setShown(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { run(); io.disconnect(); }
        }, { threshold: 0.4 });
        io.observe(ref.current);
        return () => { io.disconnect(); cancelAnimationFrame(raf); };
    }, [target, duration]);

    const text = shown.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return <span ref={ref} className="tnum">{prefix}{text}{suffix}</span>;
}
