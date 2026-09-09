import React from 'react';

/**
 * Jedyny komponent przycisku/CTA na stronie publicznej (docs/design-fixes.md, FAZA 3).
 *
 * Warianty: primary | secondary | ghost
 * Rozmiary: md (h 40px, px 20, 14/600) | lg (h 48px, px 28, 16/700)
 * Radius:   12px zawsze. Krój: Inter (font-sans). Sentence case — komponent wymusza `normal-case`,
 *           a tekst przekazuje się w zdaniu (bez `uppercase`).
 * Ikona:    opcjonalna, po prawej, 16px, wyśrodkowana w pionie względem tekstu.
 * Stany:    default / hover / active / focus-visible (globalny ring z FAZY 1) / disabled.
 * Tone:     'light' (domyślnie) | 'dark' — na ciemnych sekcjach (`.section-dark`).
 *
 * Kolory pochodzą WYŁĄCZNIE z tokenów w src/index.css (@theme):
 *   --color-cta-primary(-hover|-active|-text)             — wypełnienie primary na jasnym tle (STOP 3.2)
 *   --color-cta-primary-dark(-hover|-active|-text)        — wypełnienie primary na ciemnym tle
 *   --color-cta-outline(-hover)                           — tekst/obramowanie secondary i ghost (zawsze ciemny)
 *
 * `className` służy tylko do layoutu (marginesy, szerokość, wyrównanie) — nie nadpisuj nim kolorów,
 * paddingów ani rozmiaru tekstu (kolejność arkusza, nie propsów, decyduje o wyniku).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';
export type ButtonTone = 'light' | 'dark';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  /** Ikona (lucide) renderowana po prawej stronie tekstu, skalowana do 16px. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type AnchorOnlyKeys = Exclude<
  keyof React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof React.ButtonHTMLAttributes<HTMLButtonElement>
>;

export type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined } & {
    [K in AnchorOnlyKeys]?: never;
  };

export type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
    disabled?: never;
    type?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-sans normal-case whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,scale] duration-150 cursor-pointer ' +
  'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none';

const SIZE: Record<ButtonSize, string> = {
  md: 'h-10 px-5 text-sm font-semibold',
  lg: 'h-12 px-7 text-base font-bold',
};

const VARIANT: Record<ButtonTone, Record<ButtonVariant, string>> = {
  light: {
    primary:
      'bg-cta-primary text-cta-primary-text hover:bg-cta-primary-hover active:bg-cta-primary-active active:scale-[0.98]',
    secondary:
      'bg-white text-cta-outline border border-cta-outline hover:bg-cta-outline/5 active:bg-cta-outline/10',
    ghost: 'bg-transparent text-cta-outline hover:underline underline-offset-4 active:text-cta-outline-hover',
  },
  dark: {
    primary:
      'bg-cta-primary-dark text-cta-primary-dark-text hover:bg-cta-primary-dark-hover active:bg-cta-primary-dark-active active:scale-[0.98] focus-visible:outline-accent-apricot',
    secondary:
      'bg-transparent text-white border border-white/40 hover:bg-white/10 active:bg-white/20 focus-visible:outline-accent-apricot',
    ghost:
      'bg-transparent text-white hover:underline underline-offset-4 active:text-white/80 focus-visible:outline-accent-apricot',
  },
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  tone = 'light',
  fullWidth = false,
  className = '',
}: Pick<CommonProps, 'variant' | 'size' | 'tone' | 'fullWidth' | 'className'>): string {
  return [BASE, SIZE[size], VARIANT[tone][variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');
}

const isAriaDisabled = (v: unknown) => v === true || v === 'true';

export function Button(props: ButtonAsLink): React.ReactElement;
export function Button(props: ButtonAsButton): React.ReactElement;
export function Button(props: ButtonProps): React.ReactElement {
  const { variant, size, tone, icon, fullWidth, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, tone, fullWidth, className });
  const content = (
    <>
      <span>{children}</span>
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
      ) : null}
    </>
  );

  if (rest.href !== undefined) {
    const { href, onClick, tabIndex, ...anchorRest } = rest as ButtonAsLink;
    const disabled = isAriaDisabled(anchorRest['aria-disabled']);
    // Link "disabled" na serio: bez href, poza tab-orderem, bez akcji na Enter/klik.
    return (
      <a
        href={disabled ? undefined : href}
        tabIndex={disabled ? -1 : tabIndex}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={classes}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { type = 'button', onClick, ...buttonRest } = rest as ButtonAsButton;
  const ariaDisabled = isAriaDisabled(buttonRest['aria-disabled']);
  return (
    <button
      type={type}
      className={classes}
      onClick={ariaDisabled ? (e) => e.preventDefault() : onClick}
      {...buttonRest}
    >
      {content}
    </button>
  );
}

export default Button;
