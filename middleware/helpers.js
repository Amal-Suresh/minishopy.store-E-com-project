var hbs = require("express-handlebars")
const handlebars = require('handlebars')

module.exports={
    pagination: function(totalPages, currentPage, options) {
        let result = '';
        currentPage = parseInt(currentPage); // Convert to number
        totalPages = parseInt(totalPages);
        if (currentPage > 1) {
          result += '<span  > <a class="me-3 text-dark fw-bold" href="?page=' + (currentPage - 1) + '">Previous</a> </span>'; // Add previous page link
        }
        for (let i = 1; i <= totalPages; i++) {
          result += '<span class="product__pagination"> <a href="?page=' + i + '">' + i + '</a> </span> ';
        }
        if (currentPage < totalPages) {
          result += '<span > <a class="text-dark fw-bold" href="?page=' + (currentPage + 1) + '">Next</a> </span>'; // Add next page link
        }
        return new handlebars.SafeString(result);
      }
}