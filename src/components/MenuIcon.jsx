export function MenuIcon({ size = 24, ...props }) {
  return (
    <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path strokeDasharray="16" d="M19 5h-14">
          <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0" />
        </path>
        <path strokeDasharray="12" strokeDashoffset="12" d="M19 12h-9">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.3s" dur="0.2s" to="0" />
        </path>
        <path strokeDasharray="16" strokeDashoffset="16" d="M19 19h-14">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.3s" to="0" />
        </path>
        <path strokeDasharray="12" strokeDashoffset="12" d="M7 9l-3 3l3 3">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" to="0" />
        </path>
      </g>
    </svg>
  );
}
