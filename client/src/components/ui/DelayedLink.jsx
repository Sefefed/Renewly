import { forwardRef, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * A Link wrapper that delays navigation to create a more tactile interaction.
 * Accepts the same props as react-router-dom's Link plus an optional `delay` (ms).
 */
const DelayedLink = forwardRef(
  (
    {
      to,
      delay = 400,
      replace = false,
      state,
      onClick,
      onNavigate,
      disableDuringDelay = true,
      children,
      ...rest
    },
    ref
  ) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleClick = (event) => {
      if (disableDuringDelay && timeoutRef.current) {
        event.preventDefault();
        return;
      }

      if (onClick) {
        onClick(event);
      }

      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (typeof onNavigate === "function") {
          onNavigate();
        }
        navigate(to, { replace, state });
      }, delay);
    };

    const isPending = Boolean(timeoutRef.current);

    return (
      <Link
        {...rest}
        ref={ref}
        to={to}
        onClick={handleClick}
        aria-busy={isPending || undefined}
        data-pending={isPending ? "" : undefined}
      >
        {typeof children === "function" ? children({ isPending }) : children}
      </Link>
    );
  }
);

DelayedLink.displayName = "DelayedLink";

export default DelayedLink;
