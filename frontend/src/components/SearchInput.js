import React, { useEffect, useRef } from 'react';

const SearchInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search songs..."
      onChange={onChange}
      value={value}
      className="search-input"
      autoFocus
    />
  );
};

export default SearchInput; 
