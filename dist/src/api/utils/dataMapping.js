export function convertUnderscorePropertiesToCamelCase(obj) {
    if (!obj || Array.isArray(obj) || typeof obj !== 'object' || Object.prototype.toString.apply(obj) === '[object Date]') {
        return obj;
    }
    else {
        const newObj = {};
        for (let property in obj) {
            const camelProperty = convertUnderscoreStringToCamelCase(property);
            newObj[camelProperty] = convertUnderscorePropertiesToCamelCase(obj[property]);
        }
        return newObj;
    }
}
function convertUnderscoreStringToCamelCase(s) {
    const wordsOfString = s.split('_');
    let camelString = wordsOfString[0];
    for (let i = 1; i < wordsOfString.length; i++) {
        camelString +=
            wordsOfString[i][0].toUpperCase() + wordsOfString[i].slice(1);
    }
    return camelString;
}
export function decodeGender(code) {
    const codeIndex = typeof code === 'number' ? code : Number(code.readInt8());
    const GENDER = ['male', 'female', 'other'];
    return GENDER[codeIndex] || GENDER[0];
}
export function encodeGender(gender) {
    const GENDER = ['male', 'female', 'other'];
    const indexOfGender = GENDER.indexOf(gender);
    return indexOfGender >= 0 ? indexOfGender : 0;
}
export function groupObjectsInOne(objects, properties, replaceName, replaceProperty = false) {
    if (objects.length <= 0) {
        return null;
    }
    const keysOfObject = Array.from(new Set(objects.map(Object.keys).reduce((totalKeys, keys) => [...totalKeys, ...keys], [])));
    const keepedProperties = keysOfObject.filter(key => !properties.includes(key));
    const groupedObject = getFromProperties(objects[0], keepedProperties);
    for (let object of objects) {
        const groupedValues = getFromProperties(object, properties);
        const groupedValue = replaceProperty ? groupedValues[properties[0]] : groupedValues;
        if (!Array.isArray(groupedObject[replaceName])) {
            groupedObject[replaceName] = [];
        }
        groupedObject[replaceName].push(groupedValue);
    }
    return groupedObject;
}
export function getFromProperties(object, properties) {
    const objectEntries = Object.entries(object).filter(([key]) => properties.includes(key));
    return Object.fromEntries(objectEntries);
}
