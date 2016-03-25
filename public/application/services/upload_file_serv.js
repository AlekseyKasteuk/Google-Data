/**
 * Created by alexeykastyuk on 3/22/16.
 */
app.factory('uploadFileService', ['Upload', function (Upload) {
    return function (dataUrl, url, name) {
        console.log(Upload.dataUrltoBlob(dataUrl, name).toString());
        return Upload.upload({
            url: url,
            method: 'POST',
            data: {
                message: 'HELLO WORLD!'
            },
            file: Upload.dataUrltoBlob(dataUrl, name)
        });
    }
}])