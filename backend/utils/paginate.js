const paginate = (model, page, limit) => {
    page = Math.max(1, page); // Ensure the page is at least 1
    const skip = (page - 1) * limit;
  
    return {
      query: model.skip(skip).limit(limit),
      meta: {
        currentPage: page,
        limit,
      },
    };
  };
  
  module.exports = paginate;
  