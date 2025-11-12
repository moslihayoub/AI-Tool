// FIX: Changed to default react import and updated hooks usage to resolve JSX intrinsic element type errors.
import * as React from 'react';

export const AnimatedBackground: React.FC = () => {
    React.useEffect(() => {
        const container = document.getElementById('particle-container');
        if (!container) return;

        // Clean up any existing particles before adding new ones
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const particleCount = 40;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 8 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const xEnd = Math.random() * 90 + 5;
            const yEnd = Math.random() * 90 + 5;
            const zEnd = Math.random() * 200 - 100;
            
            particle.style.setProperty('--x', `${xEnd}vw`);
            particle.style.setProperty('--y', `${yEnd}vh`);
            particle.style.setProperty('--z', `${zEnd}px`);
            
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;

            const hue = Math.random() * 360;
            particle.style.background = `hsl(${hue}, 70%, 60%)`;

            const animationDuration = Math.random() * 15 + 5;
            const animationDelay = Math.random() * 5;
            particle.style.animation = `particle-animation ${animationDuration}s linear infinite`;
            particle.style.animationDelay = `-${animationDelay}s`;
            
            fragment.appendChild(particle);
        }

        container.appendChild(fragment);

    }, []);

    return <div id="particle-container"></div>;
};