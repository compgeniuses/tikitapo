import React, { useEffect, useState } from 'react';

const Firework: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return (
    <div className="absolute w-1 h-1 bg-white rounded-full" style={style}></div>
  );
};

const createFireworkStyles = (count: number) => {
  const styles: React.CSSProperties[] = [];
  const colors = ['#FFC700', '#FF3D3D', '#00FFC2', '#00A3FF', '#B800FF'];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const distance = 50 + Math.random() * 50; // pixels
    const duration = 0.8 + Math.random() * 0.4;
    
    styles.push({
      '--angle': `${angle}deg`,
      '--distance': `${distance}px`,
      animation: `explode ${duration}s ease-out forwards`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0,
    } as React.CSSProperties);
  }
  return styles;
};

const FireworkBurst: React.FC<{ x: string, y: string, delay: number }> = ({ x, y, delay }) => {
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    // We only need to generate the styles once per burst
    setStyles(createFireworkStyles(20));
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute" style={{ top: y, left: x, animation: `fly ${delay}s ease-in forwards`, opacity: 0 }}>
      {styles.map((style, index) => (
        <Firework key={index} style={style} />
      ))}
       <style>
        {`
          @keyframes fly {
            0% { transform: translateY(100px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(0); opacity: 0; }
          }
          @keyframes explode {
            0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
            100% { transform: rotate(var(--angle)) translateY(var(--distance)); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export const Fireworks: React.FC = () => {
    const [bursts, setBursts] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const createBursts = () => {
            const newBursts = Array.from({ length: 5 }).map((_, i) => (
                 <FireworkBurst 
                    key={i} 
                    x={`${10 + Math.random() * 80}%`} 
                    y={`${20 + Math.random() * 60}%`}
                    delay={0.5 + Math.random() * 1}
                />
            ));
            setBursts(newBursts);
        };
        createBursts();
    }, []);

    return <div className="absolute inset-0 overflow-hidden pointer-events-none">{bursts}</div>;
};