async function checkEmpty(data) {
    if (data == '' || data == null || data == undefined) {
        console.log(data);
        return true;
    } else {
        return false;
    }
}
module.exports = checkEmpty