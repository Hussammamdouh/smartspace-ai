import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  showPageInfo = true 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {showPageInfo && (
        <div className="text-sm text-[#A58077]">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="First page"
        >
          <FaAngleDoubleLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous page"
        >
          <FaChevronLeft size={14} />
        </button>

        {/* Page Numbers */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white transition-all duration-200"
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="text-[#A58077]">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
              currentPage === page
                ? 'bg-[#A58077] text-white border-[#A58077]'
                : 'bg-[#2C2C2C] text-[#E5CBBE] border-[#3C3C3C] hover:bg-[#A58077] hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-[#A58077]">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white transition-all duration-200"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next page"
        >
          <FaChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:bg-[#A58077] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Last page"
        >
          <FaAngleDoubleRight size={14} />
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  showPageInfo: PropTypes.bool,
};

export default Pagination;





