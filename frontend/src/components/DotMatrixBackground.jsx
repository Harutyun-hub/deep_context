export function DotMatrixBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(11, 14, 20, 0.4) 60%, rgba(11, 14, 20, 0.85) 100%)',
        }}
      />
    </div>
  );
}
