import React, { CSSProperties, ReactNode, useId, useMemo, useState } from 'react';

interface LiquidGlassProps {
    children: ReactNode;
    displacementScale?: number;
    blurAmount?: number;
    saturation?: number;
    aberrationIntensity?: number;
    elasticity?: number;
    cornerRadius?: number;
    padding?: string;
    className?: string;
    style?: CSSProperties;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const LiquidGlass: React.FC<LiquidGlassProps> = ({
    children,
    displacementScale = 70,
    blurAmount = 0.0625,
    saturation = 140,
    aberrationIntensity = 2,
    elasticity = 0.15,
    cornerRadius = 999,
    padding = '24px 32px',
    className = '',
    style,
}) => {
    const filterId = useId().replace(/:/g, '');
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const shellTransform = useMemo(() => {
        const tx = mouse.x * elasticity * 4;
        const ty = mouse.y * elasticity * 4;
        return `translate3d(${tx}px, ${ty}px, 0)`;
    }, [mouse.x, mouse.y, elasticity]);

    const highlightOpacity = 0.2 + Math.abs(mouse.x) * 0.06 + Math.abs(mouse.y) * 0.04;
    const glowX = 50 + mouse.x * 12;
    const glowY = 40 + mouse.y * 12;

    return (
        <div
            className={`relative inline-block ${className}`}
            style={style}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                setMouse({
                    x: clamp((e.clientX - cx) / Math.max(rect.width / 2, 1), -1, 1),
                    y: clamp((e.clientY - cy) / Math.max(rect.height / 2, 1), -1, 1),
                });
            }}
            onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        >
            <svg width="0" height="0" aria-hidden="true" className="absolute">
                <defs>
                    <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="noise" />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={Math.max(8, displacementScale * 0.35)}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            <div
                className="relative overflow-hidden"
                style={{
                    borderRadius: `${cornerRadius}px`,
                    padding,
                    transform: shellTransform,
                    transition: 'transform 160ms ease-out',
                    backdropFilter: `blur(${4 + blurAmount * 32}px) saturate(${saturation}%)`,
                    WebkitBackdropFilter: `blur(${4 + blurAmount * 32}px) saturate(${saturation}%)`,
                    background: 'rgba(255, 255, 255, 0.08)',
                    boxShadow:
                        '0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.08)',
                }}
            >
                <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        filter: `url(#${filterId})`,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 60%)',
                    }}
                />
                <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: clamp(highlightOpacity, 0.16, 0.34),
                        background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.56), rgba(255,255,255,0) 56%)`,
                        mixBlendMode: 'screen',
                    }}
                />
                <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        boxShadow: `${aberrationIntensity}px 0 0 rgba(255,80,80,0.08), ${-aberrationIntensity}px 0 0 rgba(80,160,255,0.08)`,
                    }}
                />
                <div className="relative z-[1]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LiquidGlass;
