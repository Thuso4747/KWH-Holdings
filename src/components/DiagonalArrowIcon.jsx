export function DiagonalArrowIcon({ size = '1em', ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 18L6 6m2 12h10V8" />
    </svg>
  );
}
