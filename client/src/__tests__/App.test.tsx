import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renderiza el título principal', () => {
    render(<App />);
    expect(screen.getByText(/administrador/i)).toBeInTheDocument();
  });
});
