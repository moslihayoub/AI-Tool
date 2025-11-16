// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to default React import to correctly populate the global JSX namespace.
import React from 'react';

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
            const yEnd = Math.random() * 90