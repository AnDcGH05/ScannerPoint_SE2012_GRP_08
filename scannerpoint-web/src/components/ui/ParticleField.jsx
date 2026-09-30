import { useEffect, useRef } from 'react';

// Orange, beige, white and a little warning-amber (values mirror theme.css)
const COLORS = ['#FF6B35', '#FF6B35', '#F5F5DC', '#F5F5DC', '#FFFFFF', '#E8A317'];
const SPOKES = 5;
const TEETH = 12;

// Where a particle sits on the wheel, as polar coordinates (angle, radius fraction).
function wheelSlot(i, n) {
    const f = i / n;
    const rand = Math.random();
    if (f < 0.32) return { a: rand * Math.PI * 2, r: 1 };                       // tyre
    if (f < 0.52) return { a: rand * Math.PI * 2, r: 0.74 };                    // rim
    if (f < 0.62) return { a: rand * Math.PI * 2, r: 0.2 };                     // hub
    if (f < 0.88) {                                                             // spokes
        const spoke = Math.floor(rand * SPOKES);
        return { a: (spoke / SPOKES) * Math.PI * 2, r: 0.2 + Math.random() * 0.54 };
    }
    const tooth = Math.floor(rand * TEETH);                                     // gear teeth
    return { a: (tooth / TEETH) * Math.PI * 2 + (Math.random() - 0.5) * 0.14, r: 1.13 };
}

/**
 * Lightweight 2D canvas of small outlined triangles.
 * shape="wheel" assembles them into a wheel rim with gear teeth; shape="ambient" just drifts.
 * Pauses when off-screen or the tab is hidden, and draws a single static frame
 * under prefers-reduced-motion.
 */
export default function ParticleField({ shape = 'wheel', count = 220, interactive = true, className = '' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let w = 0, h = 0, raf = 0, visible = true, last = performance.now(), spin = 0;
        const mouse = { x: -9999, y: -9999 };

        const particles = Array.from({ length: count }, (_, i) => ({
            ...wheelSlot(i, count),
            x: Math.random(), y: Math.random(), // replaced with pixels on first resize
            vx: 0, vy: 0,
            dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
            size: 3.5 + Math.random() * 5.5,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.012,
            phase: Math.random() * Math.PI * 2,
            color: COLORS[i % COLORS.length],
            alpha: shape === 'wheel' ? 0.55 + Math.random() * 0.45 : 0.18 + Math.random() * 0.3,
            placed: false,
        }));

        const target = (p, t) => {
            const R = Math.min(w, h) * 0.36;
            const a = p.a + spin;
            return {
                x: w / 2 + Math.cos(a) * R * p.r + Math.sin(t * 0.0009 + p.phase) * 3,
                y: h / 2 + Math.sin(a) * R * p.r + Math.cos(t * 0.0011 + p.phase) * 3,
            };
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.lineWidth = 1.2;
            for (const p of particles) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.alpha;
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(p.size * 0.87, p.size * 0.5);
                ctx.lineTo(-p.size * 0.87, p.size * 0.5);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        };

        const step = (now) => {
            const dt = Math.min(40, now - last) / 16.7;
            last = now;
            spin += 0.0012 * dt;
            for (const p of particles) {
                if (shape === 'wheel') {
                    const t = target(p, now);
                    p.vx += (t.x - p.x) * 0.012 * dt;
                    p.vy += (t.y - p.y) * 0.012 * dt;
                } else {
                    p.vx += p.dx * 0.02 * dt;
                    p.vy += p.dy * 0.02 * dt;
                }
                // subtle push away from the pointer
                const mx = p.x - mouse.x, my = p.y - mouse.y;
                const d2 = mx * mx + my * my;
                if (d2 < 110 * 110 && d2 > 1) {
                    const force = (1 - Math.sqrt(d2) / 110) * 1.4;
                    p.vx += (mx / Math.sqrt(d2)) * force * dt;
                    p.vy += (my / Math.sqrt(d2)) * force * dt;
                }
                p.vx *= 0.9; p.vy *= 0.9;
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.rot += p.vr * dt;
                if (shape !== 'wheel') {
                    if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
                    if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
                }
            }
            draw();
            raf = visible ? requestAnimationFrame(step) : 0;
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = rect.width; h = rect.height;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            for (const p of particles) {
                if (p.placed) continue;
                p.placed = true;
                if (reduced && shape === 'wheel') {
                    Object.assign(p, target(p, 0));   // static frame: already assembled
                } else {
                    p.x *= w; p.y *= h;               // start scattered, then assemble
                }
            }
            if (reduced || !raf) draw();
        };

        const start = () => { if (!raf && !reduced && visible) { last = performance.now(); raf = requestAnimationFrame(step); } };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        resize();

        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting && !document.hidden;
            if (visible) start(); else stop();
        });
        io.observe(canvas);
        const onVisibility = () => { if (document.hidden) stop(); else start(); };
        document.addEventListener('visibilitychange', onVisibility);

        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
        };
        const onLeave = () => { mouse.x = mouse.y = -9999; };
        if (interactive && !reduced) {
            window.addEventListener('pointermove', onMove, { passive: true });
            window.addEventListener('pointerleave', onLeave);
        }

        return () => {
            stop(); ro.disconnect(); io.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerleave', onLeave);
        };
    }, [shape, count, interactive]);

    return <canvas ref={canvasRef} className={`particle-field ${className}`} aria-hidden="true" />;
}
