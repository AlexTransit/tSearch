var view = function () {
    var trackerFilter = null;
    var keywordFilter = null;
    var categoryFilter = null;
    var lastFilterWord = '';
    var autoMove = null;
    var HideLeech = (localStorage.HideLeech !== undefined) ? parseInt(localStorage.HideLeech) : true;
    var HideSeed = (localStorage.HideSeed !== undefined) ? parseInt(localStorage.HideSeed) : false;
    var ShowIcons = (localStorage.ShowIcons !== undefined) ? parseInt(localStorage.ShowIcons) : true;
    var HideZeroSeed = (localStorage.HideZeroSeed !== undefined) ? parseInt(localStorage.HideZeroSeed) : false;
    var AdvFiltration = (localStorage.AdvFiltration !== undefined) ? parseInt(localStorage.AdvFiltration) : 2;
    var auth = function (s,t) {
        $('ul.trackers').children('li[data-id="'+t+'"]').children('ul').remove();
        if (!s)
            $('ul.trackers').children('li[data-id="'+t+'"]').append('<ul><li><a href="'+tracker[t].login_url+'" target="_blank">Войти</a></li></ul>');
    }
    var clear_table = function () {
        $('#rez_table').children('tbody').empty();
        $('div.filter').children('input').val('');
        keywordFilter = null;
        lastFilterWord = '';
        $('div.filter div.btn').hide();
        $('ul.trackers li a.selected').removeClass('selected');
        trackerFilter = null;
    }
    var loadingStatus  = function (s,t) {
        var tracker_img = $('ul.trackers').children('li[data-id="'+t+'"]').children('div.tracker_icon');
        switch (s) {
            case 0:
                tracker_img.css('background-image','url(/images/loading.gif)');
                break;
            case 1:
                tracker_img.removeAttr('style');
                break;
            case 2:
                tracker_img.css('background-image','url(/images/error.png)');
                break;
        }
    }
    var addTrackerInList = function (i) {
        $('body').append('<style>div.tracker_icon.num'+i+' { background-image: url('+tracker[i].icon+'); }</style>');
        $('<li data-id="'+i+'"/>').append($('<div class="tracker_icon num'+i+'" data-count="0"/>')).append($('<a href="#">'+tracker[i].name+'</a>').click(function() {
            if ($(this).attr('class') == 'selected') {
                $(this).removeClass('selected');
                trackerFilter = null;
            } else {
                $('ul.trackers li a.selected').removeClass('selected');
                $(this).addClass('selected');
                trackerFilter = $(this).parent('li').attr('data-id');
            }
            updateCategorys();
            $('ul.categorys').children('li.selected').trigger('click');
            return false;
        })).append('<i/>').appendTo($('ul.trackers'));
    }
    var write_result = function (t,a,s) {
        var c = '';
        $('#rez_table').children('tbody').children('tr[data-tracker='+t+']').remove();
        var s_s = contentFilter(s.replace(/\s+/g," ").replace(/</g,"&lt;").replace(/>/g,"&gt;"));
        var sum = 0;
        $.each(a, function (k,v) {
            if (HideZeroSeed && v.seeds == 0) return false;
            sum++;
            var title = filterText(s_s,v.title);
            var filter = '';
            var fk = 0;
            if (trackerFilter!=null && trackerFilter != t) filter = 'style="display: none;"';
            if (categoryFilter!=null && categoryFilter != v.category.id) filter = 'style="display: none;"';
            if (keywordFilter!=null) {
                var keyword = $.trim($('div.filter').children('input').val()).replace(/\s+/g," ");
                if (title==filterTextCheck(keyword,title)) 
                    filter = 'style="display: none;"';
                else
                    fk = 1;
            }
            c = c + '<tr '+filter+' data-kf="'+fk+'" data-tracker="'+t+'" data-c="'+v.category.id+'">'
            +'  <td class="time" data-value="'+v.time+'" title="'+unixintimetitle(v.time)+'">'+unixintime(v.time)+'</td>'
            +'  <td class="name"><div class="title"><a href="'+v.url+'" target="_blank">'+title+'</a>'+
            ((v.category.title == null && ShowIcons)?'<div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div>':'')
            +'</div>'
            +((v.category.title != null)?'<ul><li class="category">'+((v.category.url == null)?v.category.title:'<a href="'+v.category.url+'" target="blank">'+v.category.title+'</a>')+'</li>'+((ShowIcons)?'<li><div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div></li>':'')+'</ul>':'')
            +'</td>'
            +'  <td class="size" data-value="'+v.size+'">'+((v.dl != null)?'<a href="'+v.dl+'" target="_blank">'+bytesToSize(v.size)+' ↓</a>':bytesToSize(v.size))+'</td>'
            +((!HideSeed)?'  <td class="seeds" data-value="'+v.seeds+'">'+v.seeds+'</td>':'')
            +((!HideLeech)?'  <td class="leechs" data-value="'+v.leechs+'">'+v.leechs+'</td>':'')
            +'</tr>';
        });
        updateTrackerResultCount(t,sum);
        $('#rez_table').children('tbody').append(contentUnFilter(c));
        $('#rez_table').trigger("update");
        loadingStatus(1,t);
        updateCategorys();
    }
    var bytesToSize = function (bytes,nan) {
        //переводит байты в строчки
        var sizes = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб', 'Eb', 'Zb', 'Yb'];
        if (nan==null) nan = 'n/a';
        if (bytes == 0) return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    var utiemonstr = function (shtamp) {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var m = dt.getMonth()+1;
        if (m.toString().length==1)
            m = '0'+m.toString();
        var d = dt.getDate();
        if (d.toString().length==1)
            d = '0'+d.toString();
        var h = dt.getHours();
        if (h.toString().length==1)
            h = '0'+h.toString();
        var mi = dt.getMinutes();
        if (mi.toString().length==1)
            mi = '0'+mi.toString();
        var sec = dt.getSeconds();
        if (sec.toString().length==1)
            sec = '0'+sec.toString();
        var t = d+'-'+m+'-'+dt.getFullYear();
        return t;
    }
    var unixintimetitle = function (i) {
        if (i == 0) 
            return '∞';
        else
            return utiemonstr(i);
    }
    var unixintime = function (i)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        theDate = utiemonstr(i);
        if (i == 0) return '∞';
        i = now_time - i;
        if (i<0) return theDate;
        var day = Math.floor(i/60/60/24);
        var week = Math.floor(day/7);
        var month = Math.floor(day/30);
        week = Math.floor((day-30*month)/7);
        var hour = Math.floor((i - day*60*60*24)/60/60);
        var minutes = Math.floor((i - day*60*60*24 - hour*60*60)/60);
        var seconds = Math.floor((i - day*60*60*24 - hour*60*60 - minutes*60));
        day = Math.floor(i/60/60/24 - 7*week);
        if (month>1) return theDate;
        var str_month = (month<5)?(month<2)?                    ' месяц':   ' месяца':  ' месяцев';
        var str_week = (week<5)?(week<2)?(week<1)?              ' недель':  ' неделя':  ' недели':  ' недель';
        var str_day = (day<5)?(day<2)?(day<1)?                  ' дней':    ' день':    ' дня':     ' дней';
        var str_hour = (hour<5)?(hour<2)?(hour<1)?              ' часов':   ' час':     ' часа':    ' часов';
        var str_minutes = (minutes<5)?(minutes<2)?(minutes<1)?  ' минут':   ' минута':  ' минуты':  ' минут';
        var str_seconds = (seconds<5)?(seconds<2)?(seconds<1)?  ' секунд':  ' секунда': ' секунды': ' секунд';
        if (month>0)
            return month + str_month+((week>0)?' '+week+str_week:'');
        if (week>0)
            return week + str_week+((day > 0)?' '+day+str_day:'');
        if (day>0)
            return day+str_day+((hour>0)?' '+hour+str_hour:'');
        if (hour>0)
            return hour+str_hour+((minutes>0)?' '+minutes+str_minutes:'');
        if (minutes>0)
            return minutes+str_minutes+((seconds>0)?' '+seconds+str_seconds:'');
        if (seconds>0)
            return seconds+str_seconds;
        return theDate;
    }
    var updateTrackerResultCount = function (t,c,l) {
        if (l == null && c == null) {
            var c = $('ul.trackers li[data-id="'+t+'"]').attr('data-count');
            if (c == null) c = 0;
            $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
        } else
        if (l == null) {
            $('ul.trackers').children('li[data-id="'+t+'"]').attr('data-count',c).children('i').html('('+c+')');
        }else {
            if (l == 1)
                $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
        }
    }
    var contentFilter = function (c) {
        var c = c.replace(/\/\//img,'#blockurl#').replace(/script/img,'#blockscr#');
        return c;
    }
    var contentUnFilter = function (c) {
        var c = c.replace(/#blockurl#/img,'//').replace(/#blockscr#/img,'script');
        return c;
    }
    var filterText = function (s,t) {
        var s = $.trim(s);
        var new_name = t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        if (s != '') {
            var tmp = s.split(" ");
            new_name = new_name.replace(new RegExp('('+tmp.join('|')+')',"ig"),"<b>$1</b>");
        }
        return new_name;
    }
    var filterTextCheck = function (s,t) {
        if (s == '') return 'a';
        var r = t;
        if (AdvFiltration == 1) {
            var tmp = s.split(" ");
            if (t.replace(new RegExp(tmp.join('|'),"i"),'') != t)
                r = 'a';
        } else 
        if (AdvFiltration == 2) {
            var tmp = s.split(" ");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i=0;i<tmp_l;i++) {
                if (t.replace(new RegExp(tmp[i],"i"),'') == t) {
                    trgr = false;
                    break;
                }
            }
            if (trgr)
                r = 'a';
        }
        else {
            if (t.replace(new RegExp(s,"i"),'') != t)
                r = 'a';
        }
        return r;
    }
    var updateTrackerCount = function () {
        var li = $('ul.trackers').children('li');
        var t_c = li.length;
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).attr('data-id');
            if (keywordFilter==null)
                updateTrackerResultCount(id);
            else
            if (keywordFilter!=null) {
                var count = $('#rez_table').children('tbody').children('tr[data-tracker='+id+'][data-kf=1]').length;
                updateTrackerResultCount(id,count,1);
            }
        }
    }
    var updateCategorys = function () {
        var sum = 0;
        var nl = $('ul.categorys').children('li').length;
        for (var i=0;i<nl-1;i++) {
            var filter = '[data-c='+i+']';
            if (trackerFilter!=null)
                filter += '[data-tracker='+trackerFilter+']';
            if (keywordFilter!=null)
                filter += '[data-kf=1]';
            var count = $('#rez_table').children('tbody').children('tr'+filter).length;
            if (count > 0) {
                $('ul.categorys').children('li[data-id="'+i+'"]').css('display','inline-block').children('i').html('('+count+')');
                sum += count;
            } else {
                $('ul.categorys').children('li[data-id="'+i+'"]').css('display','none');
            }
        }
        $('ul.categorys').children('li').eq(0).children('i').html('('+sum+')');
        if (autoMove != null) {
            var item =  $('ul.categorys').children('li[data-id="'+autoMove+'"]');
            if (item.css('display') == 'inline-block'){
                $('ul.categorys').children('li.selected').removeClass('selected');
                item.addClass('selected');
                item.trigger('click');
                autoMove = null;
            }
        }
        if ($('ul.categorys').children('li.selected').css('display') == 'none') {
            var category =  $('ul.categorys').children('li.selected').attr('data-id');
            $('ul.categorys').children('li.selected').removeClass('selected');
            $('ul.categorys').children('li').eq(0).addClass('selected');
            $('ul.categorys').children('li.selected').trigger('click');
            autoMove = (category==null)?null:category;
        }
    }
    var tableFilter = function (keyword) {
        if (keyword != $('div.filter').children('input').val()) return;
        $('div.filter div.btn').css('background-image','url(/images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g," ");
        if (keyword == '') {
            $('div.filter').children('input').val('');
            keywordFilter = null;
            $('ul.categorys').children('li.selected').trigger('click');
            updateCategorys();
            updateTrackerCount();
            $('div.filter div.btn').hide();
            return;
        }
        keywordFilter = keyword;
        if (keywordFilter != lastFilterWord) {
            //lastFilterCache = null;
            lastFilterWord = keyword;
            //поиск и фильтрация контента
            var tr = $('#rez_table').children('tbody').children('tr');
            var tr_count = tr.length;
            for (var i = 0;i<tr_count;i++) {
                var tr_eq = tr.eq(i);
                var name = tr_eq.children('td.name').children('div.title').children('a').text();
                var f_name = filterTextCheck(keyword,name);
                if (name != f_name)
                    tr_eq.attr('data-kf',1);
                else
                    tr_eq.attr('data-kf',0);
            }
        }
        $('ul.categorys').children('li.selected').trigger('click');
        updateCategorys();
        updateTrackerCount();
        $('div.filter div.btn').css('background-image','url(/images/clear.png)');
    }
    var triggerBlank = function () {
        $('div.result_panel').css('display','none');
        $('div.explore').css('display','block');
        view.clear_table();
        $('form[name=search]').children('input[type=text]').val('');
        document.title = 'Torrents MultiSearch'; 
        window.location = '#s=';
        global_wl_hash = location.hash;
        $('form[name=search]').children('input[type=text]').val('').focus();
        $('ul.trackers li').attr('data-count',0);
        updateTrackerCount();
        explore.getLoad();
    }
    var triggerSearch = function (keyword) {
        $('div.result_panel').css('display','block');
        $('div.explore').css('display','none');
        view.clear_table();
        keyword = $.trim(keyword);
        $('form[name=search]').children('input[type=text]').val(keyword);
        document.title = keyword +' :: '+'TMS'; 
        window.location = '#s='+keyword;
        global_wl_hash = location.hash;
        engine.search(keyword);
    }
    return {
        result : function (t,a,s) {
            return write_result(t,a,s);
        },
        contentFilter : function (a) {
            return contentFilter(a);
        },
        contentUnFilter : function (a) {
            return contentUnFilter(a);
        },
        clear_table : function () {
            clear_table()
        },
        auth : function (s,id) {
            auth(s,id)
        },
        addTrackerInList : function (a) {
            addTrackerInList(a);
        },
        loadingStatus : function (a,b) {
            loadingStatus(a,b);
        },
        tableFilter : function (a) {
            tableFilter(a);
        },
        triggerSearch : function (a) {
            triggerSearch(a);
        },
        triggerBlank : function () {
            triggerBlank();
        },
        trackerFilter : function () { 
            return trackerFilter;
        },
        keywordFilter : function () { 
            return keywordFilter;
        },
        setCatFilter : function (a) {
            categoryFilter = a;
        },
        SetAutoMove : function (a) {
            autoMove = a;
        },
        HideLeech : function (a) {
            return HideLeech;
        },
        HideSeed : function (a) {
            return HideSeed;
        }
    }
}();
var myTextExtraction = function(node)  
{
    if ($(node).attr('data-value')!=null)
        return $(node).attr('data-value');
    if ($(node).children('div.title')!=null)
        return $(node).children('div.title').text();
    return $(node).html();
}
$(function () {
    if (view.HideLeech()) {
        $('th.leechs').remove();
    }
    if (view.HideSeed()) {
        $('th.seeds').remove();
    }
    $('form[name=search]').submit(function () {
        view.triggerSearch($(this).children('input[type=text]').val());
        return false;
    });
    var t = $('ul.categorys').children('li');
    var l = t.length;
    for (var n = 0;n<l;n++) {
        t.eq(n).click(function (event) {
            if (event.isTrigger != true)
                view.SetAutoMove(null);
            var trackerFilter = view.trackerFilter();
            var keywordFilter = view.keywordFilter();
            var id = $(this).attr('data-id');
            view.setCatFilter(id);
            $('ul.categorys').children('li.selected').removeClass('selected');
            $(this).addClass('selected');
            $('#rez_table').children('tbody').children('tr').css('display','none');
            var filter = '';
            if (id != null)
                filter += '[data-c='+id+']';
            if (trackerFilter!=null)
                filter += '[data-tracker='+trackerFilter+']';
            if (keywordFilter!=null)
                filter += '[data-kf=1]';
            $('#rez_table').children('tbody').children('tr'+filter).css('display','table-row');
            $('#rez_table').trigger("update");
        });
    }
    $('ul.categorys').children('li').css('display','none').eq(0).css('display','inline-block');
    try {
        $('#rez_table').tablesorter({
            textExtraction: myTextExtraction,
            widgets: ['zebra'],
            sortList: (localStorage.Order !== undefined) ? JSON.parse(localStorage.Order) :  [[0,1]],
            autosorter: true,
            onsort: function (s) {
                localStorage.Order = JSON.stringify(s);
            }
        });
    } catch(err) {}
    $('form[name=search]').children('input').eq(0).focus();
    $('div.filter input').keyup(function () {
        var t = $(this).val();
        $('div.filter div.btn').css('background-image','url(/images/loading.gif)');
        if (t.length > 0) {
            $('div.filter div.btn').show();
        }
        window.setTimeout(function(){
            view.tableFilter(t);
        }, 1000);
    });
    $('div.filter div.btn').click(function () {
        $('div.filter input').val('');
        view.tableFilter('');
    });
    var s = (document.URL).replace(/(.*)index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        $('form[name=search]').children('input[type=text]').val(s);
    }
    $('div.tracker_list div.setup').click(function () {
        window.location = '/options.html#back='+$.trim($('form[name=search]').children('input[type=text]').val());
    });
});
$(window).load(function () {
    var s = (document.URL).replace(/(.*)index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        view.triggerSearch(s);
    } else {
        view.triggerBlank();
    }
});
var global_wl_hash = location.hash;
$(window).bind('hashchange', function() {
    if (location.hash != global_wl_hash)
    {
        $(window).trigger('load');
        global_wl_hash = location.hash;
    }
});