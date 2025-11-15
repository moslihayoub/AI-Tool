// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace, resolving JSX intrinsic element type errors.
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
            
            // FIX: Removed erroneous 'START++' statement that was causing a reference error.
            
            particle.style.setProperty('--x-end', `${xEnd}vw`);
            particle.style.setProperty('--y-end', `${yEnd}vh`);

            const duration = Math.random() * 10 + 10;
            particle.style.animationDuration = `${duration}s`;

            const delay = Math.random() * -20;
            particle.style.animationDelay = `${delay}s`;

            fragment.appendChild(particle);
        }

        container.appendChild(fragment);
    }, []);

    // FIX: A React functional component must return a React.ReactNode. Added 'return null' as this component only handles side effects.
    return null;
};