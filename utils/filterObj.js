const filterObj = (obj, ...allowedFields) => {
    const objSet = new Set(allowedFields);
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (objSet.has(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

export default filterObj;
