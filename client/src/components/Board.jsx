const Board = ({ squares, onClick, disabled, winningLine }) => {
  const highlight = new Set(winningLine || []);

  return (
    <div style={styles.grid}>
      {squares.map((value, index) => (
        <button
          key={index}
          onClick={() => onClick(index)}
          disabled={disabled || Boolean(value)}
          style={{
            ...styles.cell,
            cursor: disabled || value ? 'default' : 'pointer',
            backgroundColor: highlight.has(index) ? '#fef9c3' : '#fff',
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 100px)',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  cell: {
    width: '100px',
    height: '100px',
    fontSize: '2.5rem',
    fontWeight: '600',
    borderRadius: '0.75rem',
    border: '2px solid #cbd5f5',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
    backgroundColor: '#fff',
  },
};

export default Board;



