import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/img/logo.png';
import Vector from '../assets/img/Vector.svg';
import ModeIcon from '../assets/img/mode.svg';
import CloseIcon from '../assets/img/close.svg';
import BackIcon from '../assets/img/back.svg';
import '../styles/Header.css';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setShowTypeFilter: (show: boolean) => void;
  showTypeFilter: boolean;
  selectedPokemon: string | null;
  handleBackToHome: () => void;
}

const Header = ({
  searchTerm,
  setSearchTerm,
  setShowTypeFilter,
  showTypeFilter,
  selectedPokemon,
  handleBackToHome,
}: HeaderProps) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="header-container">
      <header className="header">
        <button className="logo-button" onClick={handleBackToHome}>
          <img src={logo} alt="Pokémon Logo" className="logo logo-animated" />
        </button>
        {(showTypeFilter || selectedPokemon) && (
          <button className="back-button" onClick={handleBackToHome}>
            {showTypeFilter ? (
              <img src={CloseIcon} alt="Close" className="close-icon" />
            ) : (
              <img src={BackIcon} alt="Back" className="back-icon" />
            )}
          </button>
        )}
      </header>
      <div className="search-container">
        <button
          className="berger-button"
          onClick={() => setShowTypeFilter(true)}
        >
          <img src={Vector} alt="Menu" className="berger-icon" />
        </button>
        <input
          type="text"
          className="search-bar"
          placeholder="Search Pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {!(showTypeFilter || selectedPokemon) && (
          <button className="theme-toggle-button" onClick={toggleTheme}>
            <img src={ModeIcon} alt="Toggle Theme" className="mode-icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;