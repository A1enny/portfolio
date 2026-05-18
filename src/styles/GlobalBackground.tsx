interface Props {
  isDark: boolean;
}

export default function GlobalBackground({ isDark }: Props) {
  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#1f2020]" : "bg-[#f5f5f7]"
      }`}
    >
      {/* MAIN GRID */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              ${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"} 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              ${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"} 1px,
              transparent 1px
            )
          `,
          backgroundSize: "56px 56px",

          WebkitMaskImage: `
            radial-gradient(
              ellipse 90% 90% at 100% 0%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,.85) 35%,
              rgba(0,0,0,.3) 60%,
              transparent 100%
            )
          `,
          maskImage: `
            radial-gradient(
              ellipse 90% 90% at 100% 0%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,.85) 35%,
              rgba(0,0,0,.3) 60%,
              transparent 100%
            )
          `,
        }}
      />

      {/* GRID — BOTTOM LEFT */}
      <div
        className="absolute bottom-0 left-0 w-[45vw] h-[45vh]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              ${isDark ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.03)"} 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              ${isDark ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.03)"} 1px,
              transparent 1px
            )
          `,
          backgroundSize: "42px 42px",

          WebkitMaskImage: `
            radial-gradient(
              ellipse 85% 85% at 0% 100%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,.75) 40%,
              rgba(0,0,0,.2) 70%,
              transparent 100%
            )
          `,
          maskImage: `
            radial-gradient(
              ellipse 85% 85% at 0% 100%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,.75) 40%,
              rgba(0,0,0,.2) 70%,
              transparent 100%
            )
          `,
        }}
      />

      {/* TOP RIGHT GLOW */}
      <div
        className="absolute -top-[300px] right-[-250px] w-[900px] h-[900px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(217,242,109,.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(217,242,109,.18) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* BOTTOM LEFT GLOW */}
      <div
        className="absolute bottom-[-350px] left-[-250px] w-[800px] h-[800px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,.10) 0%, transparent 80%)"
            : "radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 80%)",
          filter: "blur(120px)",
        }}
      />

      {/* NOISE — inline SVG turbulence, no network request */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
