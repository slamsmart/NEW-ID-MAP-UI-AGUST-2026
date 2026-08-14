import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[#006a61] text-white shadow hover:bg-[#005049] active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white shadow hover:bg-red-700 active:scale-[0.98]',
        outline:
          'border border-[#bfc9c3] bg-white text-[#191c1e] shadow-sm hover:bg-gray-50 hover:border-[#006a61] active:scale-[0.98]',
        secondary:
          'bg-[#86f2e4]/30 text-[#003527] hover:bg-[#86f2e4]/50 active:scale-[0.98]',
        ghost:
          'text-[#191c1e] hover:bg-gray-100 active:scale-[0.98]',
        link:
          'text-[#006a61] underline-offset-4 hover:underline',
        hero:
          'bg-white text-[#003527] shadow-lg hover:bg-white/90 active:scale-[0.98]',
        'hero-outline':
          'border border-white/30 text-white/90 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
