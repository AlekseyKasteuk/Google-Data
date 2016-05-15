/**
 * Created by alexeykastyuk on 5/14/16.
 */
app.filter('pagination', [function () {
    return function (items, count, page) {
        page--;
        return items.slice(count * page, count * page + count);
    }
}]);