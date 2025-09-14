import * as React from 'react';
import { Dot } from 'lucide-react';

import { cn } from '@/lib/utils';

interface InputOTPProps {
    value?: string;
    onChange?: (value: string) => void;
    maxLength?: number;
    className?: string;
    containerClassName?: string;
    disabled?: boolean;
}

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
    (
        { className, containerClassName, value = '', onChange, maxLength = 6, disabled, ...props },
        ref,
    ) => {
        const [internalValue, setInternalValue] = React.useState(value);

        React.useEffect(() => {
            setInternalValue(value);
        }, [value]);

        const handleChange = (newValue: string) => {
            if (newValue.length <= maxLength) {
                setInternalValue(newValue);
                onChange?.(newValue);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Backspace') {
                handleChange(internalValue.slice(0, -1));
            } else if (e.key.length === 1 && /[0-9]/.test(e.key)) {
                handleChange(internalValue + e.key);
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center gap-2 has-[:disabled]:opacity-50',
                    containerClassName,
                )}
                {...props}
            >
                <input
                    type="text"
                    value={internalValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={cn('sr-only', className)}
                    autoComplete="one-time-code"
                />
                {Array.from({ length: maxLength }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                            i < internalValue.length && 'bg-accent',
                            className,
                        )}
                    >
                        {internalValue[i] || ''}
                    </div>
                ))}
            </div>
        );
    },
);
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
            className,
        )}
        {...props}
    >
        {children}
    </div>
));
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
        <Dot />
    </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
