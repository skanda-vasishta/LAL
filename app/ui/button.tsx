import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg bg-purple-700 px-4 text-sm font-medium text-white transition-colors hover:bg-purple-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 active:bg-purple-800 border border-purple-500/20 shadow-sm hover:shadow-md aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
