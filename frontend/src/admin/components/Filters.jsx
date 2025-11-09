import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search...',
  onClear,
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077] focus:border-[#A58077] text-[#E5CBBE] placeholder-[#A58077] transition-all duration-200"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A58077] hover:text-[#E5CBBE] transition-colors"
          aria-label="Clear search"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onClear: PropTypes.func,
  className: PropTypes.string,
};

const FilterDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  label,
  className = '' 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077] pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-8 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077] focus:border-[#A58077] text-[#E5CBBE] appearance-none cursor-pointer transition-all duration-200"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

FilterDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};

const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className = '' 
}) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex-1">
        <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077] focus:border-[#A58077] text-[#E5CBBE] transition-all duration-200"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077] focus:border-[#A58077] text-[#E5CBBE] transition-all duration-200"
        />
      </div>
    </div>
  );
};

DateRangeFilter.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export { SearchBar, FilterDropdown, DateRangeFilter };





