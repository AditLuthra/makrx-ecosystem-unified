'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    quality?: number;
    fill?: boolean;
    lazy?: boolean;
}

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    placeholder = 'empty',
    blurDataURL,
    sizes,
    quality = 75,
    fill = false,
    lazy = true,
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Generate a simple blur placeholder if none provided
    const defaultBlurDataURL =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

    useEffect(() => {
        if (!lazy) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsLoaded(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1,
            },
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [lazy]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    // Error fallback
    if (hasError) {
        return (
            <div
                className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <span className="text-gray-500 text-sm">Failed to load image</span>
            </div>
        );
    }

    // For lazy loading, show placeholder until loaded
    if (lazy && !isLoaded) {
        return (
            <div
                ref={imgRef}
                className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
                style={{ width, height }}
                aria-label={alt}
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL || defaultBlurDataURL}
            sizes={sizes}
            quality={quality}
            fill={fill}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
        />
    );
}

// HOC for lazy loading any component
export function withLazyLoading<T extends object>(Component: React.ComponentType<T>) {
    return function LazyComponent(props: T) {
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '100px',
                    threshold: 0.1,
                },
            );

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            };
        }, []);

        return (
            <div ref={ref}>
                {isVisible ? (
                    <Component {...props} />
                ) : (
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                )}
            </div>
        );
    };
}
