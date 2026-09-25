// Thin horizontal bar; `percent` is clamped to 0–100. `fillClass` must be
// a literal Tailwind class string (e.g. "bg-deposit") so the build finds it.
export function ProgressBar({ percent, fillClass }) {
    const width = Math.min(100, Math.max(0, percent))

    return (
        <div className="h-1.5 bg-track rounded-full overflow-hidden">
            <div className={`h-full ${fillClass}`} style={{ width: `${width}%` }} />
        </div>
    )
}
