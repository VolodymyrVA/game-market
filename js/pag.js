var Pagination = {};
Pagination.Pager = function () {
    this.arr;
    this.paragraphsPerPage = 6;
    this.currentPage = 1;
    
    var that = this;
    this.tempArr = {"array": []};
    
    this.numPages = function () {
        $("#page").empty();
        $("#block").empty();
        var num = 0,
            $page = $('#page'),
            pagingControls = '<ul id="block">',
            curr = that.currentPage,
            min = curr - 2,
            max = curr + 2;

        if (that.arr !== null && that.paragraphsPerPage !== null) {
            num = Math.ceil(that.arr.length / that.paragraphsPerPage);
        }

        for (var i = 1; i <= num; i++) {
            if (i === 1) {
                pagingControls += '<li ><a href="#" data-num="' + i + '">first</a></li>';
                if (curr > 4) {
                    pagingControls += '<span class="dot">...</span>';
                }
            }

            if (i > 1 && i < num && min <= i && i <= max) {
                pagingControls += '<li ><a href="#" data-num="' + i + '">' + i + '</a></li>';
            }

            if (i === num && i > 1) {
                if (curr < (num - 4)) {
                    pagingControls += '<span class="dot">...</span>';
                }
                pagingControls += '<li ><a href="#" data-num="' + i + '">last</a></li>';

            }


        }

        pagingControls += '</ul>';
        $($page).append(pagingControls);

    };

    this.showPage = function (func) {
        that.numPages();
        var page;
        page = that.currentPage;
        that.tempArr.array = that.arr.slice((page - 1) * that.paragraphsPerPage, ((page - 1) * that.paragraphsPerPage) + that.paragraphsPerPage);
        
        return func(that.tempArr);
        
    };

};
