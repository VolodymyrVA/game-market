$(function () {
    "use strict";

    var viewModule = (function () {
        var minMaxPrice = [],
            price;

        var view = {

            // получение максимальной стоимости игры
            getMaxPrice: function (data) {
                var arrPrice = data.map(function (el) {
                    return parseInt(el.price);
                });
                return Math.max.apply(null, arrPrice);
            },

            initSlider: function () {
                $("#slider-range").slider({
                    range: true,
                    min: price.min,
                    max: price.max,
                    values: [price.min, price.max],
                    slide: function (event, ui) {
                        $("#amount").val("₴ " + ui.values[0] + " - ₴ " + ui.values[1]);
                    },
                    // событие стоп
                    stop: function (event, ui) {
                        minMaxPrice = [ui.values[0], ui.values[1]];
                    }
                });
                $("#amount").val("₴ " + $("#slider-range").slider("values", 0) +
                    " - ₴ " + $("#slider-range").slider("values", 1));
            },
        };

        price = {
            max: view.getMaxPrice(data.array),
            min: 0
        };

        view.initSlider();


        return {

            setContent: function (arr) {
                var json = JSON.stringify(arr);
                json = JSON.parse(json);
                $("#content").empty();
                var template = Handlebars.compile($('#contentItemTemplate').html());
                $('#content').append(template(json));
            },

            // сообщение при пустой корзине
            setError: function () {
                var $content = $("#content");
                $content.append($("<div class='error'></div>").text("Сhoose a different value"));
            },

            sortPrice: function () {
                return minMaxPrice;
            },
            initPrice: function () {
                return price;
            }
        };
    }());

    var paginationModule = (function () {
        var returnArr;
        return {
            pagSetContent: function (arr) {
                var pagination = new Pagination.Pager();
                pagination.paragraphsPerPage = 6;
                pagination.currentPage = 1;
                pagination.arr = arr;
                pagination.showPage(viewModule.setContent);

                returnArr = pagination.tempArr;


                $('#page').click(function (e) {
                    e.preventDefault();
                    var numPage = +$(e.target).attr('data-num');
                    if (numPage) {
                        pagination.currentPage = numPage;
                        pagination.showPage(viewModule.setContent);
                    }
                    returnArr = pagination.tempArr;
                });

            },
            returnObj: function (id) {
                return returnArr.array[id];

            }
        }
    })();


    var filterModule = (function () {
        var that,
            minMaxPrice,
            newArr = {"array": data.array};

        var filter = {

            // фильтр по цене
            getPriceFilterArr: function (data, minPrice, maxPrice) {
                return $.map(data, function (el) {
                    if (parseInt(el.price) >= minPrice && parseInt(el.price) <= maxPrice) {
                        return el;
                    }
                });
            },

            //функция фильтрации обектов по критерию
            getFilterArr: function (data, key, value) {
                var arrObj = $.map(data, function (el) {
                    if (el[key] === value) {
                        return el;
                    }
                });
                return arrObj;
            },


            // функция сортировки

            getSortArr: function (arr, name, dataID) {

                return [].sort.call(arr, function (a, b) {
                    if (dataID === "up") {
                        if (parseInt(a[name]) > parseInt(b[name]))
                            return -1;
                        if (parseInt(a[name]) < parseInt(b[name]))
                            return 1;
                        return 0;
                    }
                    if (dataID === "down") {
                        if (parseInt(a[name]) > parseInt(b[name]))
                            return 1;
                        if (parseInt(a[name]) < parseInt(b[name]))
                            return -1;
                        return 0;
                    }
                });
            },
            checkInspector: function (arr, item) {
                var $inputs = $("input:checked", item),
                    concatArr = [];
                if ($inputs.length) {
                    $inputs.each(function (i, item) {
                        var tempArr = that.getFilterArr(arr, $(item).attr("name"), $(item).attr("value"));
                        concatArr = concatArr.concat(tempArr);
                    });
                    arr = concatArr;
                }
                return arr;
            },

            filterEvent: function () {
                that = this;
                var price = viewModule.initPrice();

                $("#filter").submit(function (e) {
                    e.preventDefault();

                    var inputsDiv = $('.checkBlock'),
                        arrGenre = [],
                        arrPlatform = [],
                        minMaxPrice = viewModule.sortPrice();


                    newArr.array = data.array;


                    if (minMaxPrice.length) {
                        newArr.array = that.getPriceFilterArr(newArr.array, minMaxPrice[0], minMaxPrice[1]);
                    }

                    $.each(inputsDiv, function (i, item) {
                        newArr.array = that.checkInspector(newArr.array, item);
                    });

                    paginationModule.pagSetContent(newArr.array);


                    if (!newArr.array.length)
                        viewModule.setError();
                });

                $("#filter").on("reset", function (e) {
                    e.preventDefault();
                    var check = $("input:checked");
                    if (check.length) {
                        $.each(check, function (i, el) {
                            $(el).prop("checked", false);
                        });
                    }
                    $("#slider-range").slider({
                        range: true,
                        min: price.min,
                        max: price.max,
                        values: [price.min, price.max],
                        slide: function (event, ui) {
                            $("#amount").val("₴ " + ui.values[0] + " - ₴ " + ui.values[1]);
                        }
                    });

                    $("#amount").val("₴ " + $("#slider-range").slider("values", 0) +
                        " - ₴ " + $("#slider-range").slider("values", 1));

                    newArr.array = data.array;
                    //viewModule.setContent(newArr);
                    paginationModule.pagSetContent(newArr.array);
                });
            },
            sortEvent: function () {
                that = this;
                $("#headContent button").click(function (e) {
                    var data = $(this).attr("data"),
                        name = this.name;
                    newArr.array = that.getSortArr(newArr.array, name, data);
                    //viewModule.setContent(newArr);
                    paginationModule.pagSetContent(newArr.array);

                    $(".choise").removeClass();
                    $(this).addClass("choise");

                });
            },

        };
        //viewModule.setContent(newArr);
        // paginationModule.pagSetContent(newArr.array);

        filter.filterEvent();
        filter.sortEvent();

        return {

            returnObj: function (i) {
                return newArr.array[i];
            }

        };
    }());

    // модуль обработки формы входа
    var loginModul = (function () {
        var log,
            pas,
            that;

        var login = {

            getLogin: function () {
                log = $("#singIn input[type='text']").val().trim();
                pas = $("#singIn input[type='password']").val().trim();
                if (log && pas) {
                    localStorage.setItem('userName', log);
                    localStorage.setItem('userPassword', pas);
                    return true;
                }
                return false;
            },

            setLogin: function (text) {
                if (text === undefined) {
                    text = log;
                }
                $("#logOut b").text(text);
            },

            toggleView: function () {
                $("#logIn").toggleClass("hidden");
                $("#logOut").toggleClass("hidden");
            },


            // Событие входа на сайт
            logIn: function () {
                that = this;
                $("#singIn").submit(function (e) {
                    e.preventDefault();
                    var userlog = that.getLogin();
                    if (userlog) {
                        adminModule.adminPage();
                        that.setLogin();
                        that.toggleView();
                        this.reset();
                    }
                });
            },

            // Событие выхода с сайта
            logOut: function () {
                that = this;
                $("#logOut button").click(function (e) {
                    that.toggleView();
                    localStorage.setItem('userName', "");
                    localStorage.setItem('userPassword', "");
                    location.reload()
                });
            },

            logVisible: function () {
                var login = localStorage.userName;

                if (login) {
                    this.setLogin(login);
                    $("#logIn").addClass("hidden");
                    $("#logOut").removeClass("hidden");

                    return true;
                }
                $("#logOut").addClass("hidden");
                $("#logIn").removeClass("hidden");

                return false;

            }

        };

        login.logIn();
        login.logOut();
        login.logVisible();
    }());

    // модуль корзины
    var basketModul = (function () {
        var obj,
            jsonBasket = {arr: []},
            json,
            that;


        var basket = {

            // добавление товаров в корзину
            pushToBasketHB: function (arr) {
                var json = JSON.stringify(arr);

                json = JSON.parse(json);
                $(".basketField").empty();
                this.sumItem(json.arr);
                var template = Handlebars.compile($('#basketItemTemplate').html());
                $('.basketField').append(template(json));
            },

            // запись содержимого корзины в LS
            writeBasketToLS: function (arr) {
                json = JSON.stringify(arr);
                localStorage.removeItem("arr");
                localStorage.setItem("arr", json);
            },

            // добавление товаров в корзину с LS
            readBasketItemFromLS: function () {
                var item = localStorage.arr;
                if (item) {
                    jsonBasket = JSON.parse(item);
                    //console.log( item );
                    this.pushToBasketHB(jsonBasket);
                }
            },

            // подсчет товаров в корзине
            countAndShowItem: function () {
                var count = $(".basketItem").length;
                $(".basketPoints").text(count);

                if (!count) {
                    $(".basketField").append($("<div class='basketIsEmpty' />").text("Товар ещё не добавлено!!"));
                }
                else {
                    $(".basketIsEmpty").remove();
                }
            },
            // подсчет суммы товаров
            sumItem: function (arr) {
                var $basketField = $(".basketField"),
                    $div = $("<div class='sumDiv' />"),
                    sum = 0;

                $(".sumDiv").remove();
                $.each(arr, function (i, item) {
                    sum += parseInt(item.price);
                });
                if (sum) {
                    $basketField.append($div.text("Сумма покупки состовляет " + sum + " грн."));
                }
            },

            // открыть корзину
            openBasket: function () {
                $(".basket").click(function (e) {
                    e.preventDefault();
                    $(".basketDropDown").addClass("dropDown");
                });
            },

            // закрыть корзину
            closeBasket: function () {
                $(".close").click(function (e) {
                    e.preventDefault();
                    $(".basketDropDown").removeClass("dropDown");
                });
            },

            // добавить товар в корзину, клик по кнопке Купить
            addItemToBasket: function () {
                that = this;
                $("#content").click(function (e) {
                    e.preventDefault();
                    if (e.target.tagName === "BUTTON") {
                        var id = $(e.target.closest("[data-productId]")).attr("data-productId");
                        obj = paginationModule.returnObj(id);
                        [].push.call(jsonBasket.arr, obj);
                        that.pushToBasketHB(jsonBasket);
                        that.countAndShowItem();
                        that.writeBasketToLS(jsonBasket);
                    }
                });
            },

            // удалить товар с корзины
            removeItemFromBasket: function () {
                that = this;
                $(".basketField").click(function (e) {
                    e.preventDefault();
                    if (e.target.closest(".del")) {
                        var item = $(e.target.closest("[data-basketId]")).attr("data-basketId");

                        [].splice.call(jsonBasket.arr, item, 1);

                        that.pushToBasketHB(jsonBasket);
                        that.countAndShowItem();
                        that.writeBasketToLS(jsonBasket);
                    }
                });
            }
        };

        basket.readBasketItemFromLS();
        basket.countAndShowItem();
        basket.openBasket();
        basket.closeBasket();
        basket.addItemToBasket();
        basket.removeItemFromBasket();
    }());

    //модуль живого поиска
    var searchModul = (function () {
        var search = {};

        search.searchInput = function () {
            $('#search').keyup(function () {
                var searchField = $('#search').val().toLowerCase(),
                    newArr = {"array": []},
                    cont = [];
                newArr.array = data.array;
                $.each(data.array, function (key, val) {
                    var tempName = val.name.toLowerCase(),
                        tempGenre = val.genre.toLowerCase(),
                        tempPlatform = val.platform.toLowerCase(),
                        someRegexp = new RegExp(searchField);
                    if (someRegexp.test(tempName) || someRegexp.test(tempGenre) || someRegexp.test(tempPlatform)) {
                        cont.push(val);
                        newArr.array = cont;
                    }
                });
                //viewModule.setContent(newArr);
                paginationModule.pagSetContent(newArr.array);
            })
        }();
        return searchModul;
    })();

    //Модуль админа
    var adminModule = (function () {

        return {

            adminPage: function () {
                var log = 'admin',
                    pass = 333,
                    login = localStorage.getItem("userName"),
                    password = +localStorage.getItem("userPassword"),
                    $main = $('#main');
                if (pass === password && log === login) {
                    $($main).empty();
                    $($main).css({
                        'height': '49.1rem'

                    });
                    var div = '<div id="adminButton">';
                    div += '<button id="adminOption" name="option">Отрыть</button>';
                    div += '</div>';

                    $main.append(div);

                }

            },

            createAdminInput: function () {
                $('#main').click(function (e) {
                    e.preventDefault();
                    var targ = $(e.target).attr('id');
                    if (targ === 'adminOption') {
                        adminModule.hendelAdmin(admin);
                    }
                });
            }(),

            closeBlockAdmin: function () {
                $('#main').click(function (e) {
                    e.preventDefault();
                    var targ = $(e.target).attr('id');
                    if (targ === "closeBlockAdmin") {
                        $('#blockAdmin').detach();
                    }
                })
            }(),

            hendelAdmin: function (arr) {
                var json = JSON.stringify(arr);
                json = JSON.parse(json);
                $('#blockAdmin').detach();
                var template = Handlebars.compile($('#adminItemTemplate').html());
                $('#adminButton').append(template(json));
            },

            getInputData: function () {
                $('#main').click(function (e) {
                    e.preventDefault();
                    var targ = $(e.target).attr('id');

                    if (targ === "adminAddObj") {
                        var name = $('.adminName').val(),
                            genre = $('.adminGenre').val(),
                            platform = $('.adminPlatform').val(),
                            price = $('.adminPrice').val(),
                            img = $('.adminImg').val(),
                            popular = $('.adminPopular').val(),
                            adminObj = {
                                'name': name,
                                'genre': genre,
                                'platform': platform,
                                'price': price,
                                'img': img,
                                'popular': popular

                            };
                        if (adminObj.name !== "" && adminObj.genre !== "" &&
                            adminObj.platform !== "" && adminObj.price !== "" &&
                            adminObj.img !== "" && adminObj.img !== "" && adminObj.popular !== "") {
                                data.array.push(adminObj);
                        }

                        var json = JSON.stringify(data.array);
                        localStorage.setItem("data.array", json);
                        $('#main form').trigger('reset');

                    }
                });
            }()


        }

    })();
    adminModule.adminPage();


    var showModule = (function () {
        return {
            show: function () {
                var x = localStorage.getItem("data.array");
                var json = JSON.parse(x);
                if (json) {
                    data.array = json;
                    paginationModule.pagSetContent(data.array);
                } else {
                    paginationModule.pagSetContent(data.array);
                }

            }()
        }
    })();


});


