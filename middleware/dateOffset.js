exports.CURRENT_DATE = () => {
    var r = new Date();
    let currentTimeZoneOffsetInHours = r.getTimezoneOffset() / 60;
    if (currentTimeZoneOffsetInHours <= 0) {
        let ifCurrentTimeZoneOffsetInHours = (currentTimeZoneOffsetInHours) * (- 1)
        r.setHours(r.getHours() + (ifCurrentTimeZoneOffsetInHours));
    } else {
        r.setHours(r.getHours() - currentTimeZoneOffsetInHours);
    }

    return r;
};

exports.CUSTOM_DATE = (offset, day, month, year) => {
    // if(date.getDate() == 1)
    // console.log(offset)
    console.log(offset, day, month, year)
    var r = new Date();
    let currentTimeZoneOffsetInHours = offset / 60;
    if (currentTimeZoneOffsetInHours < 0) {
        currentTimeZoneOffsetInHours = currentTimeZoneOffsetInHours * -1
        console.log(currentTimeZoneOffsetInHours)
        r.setHours(r.getHours() + currentTimeZoneOffsetInHours);
    } else {
        r.setHours(r.getHours() - currentTimeZoneOffsetInHours);
    }
    r.setDate(day)
    r.setFullYear(year)
    r.setMonth(month)
    console.log('ddddddddddd', r)
    return r;
};