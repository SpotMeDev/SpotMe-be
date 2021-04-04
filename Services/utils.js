const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
/**
 * Converts a JavaScript date object into the string format yyyy-mm-dd
 * @param {Date} date JS Date object to be converted
 * @return {string} string format of date (yyyy-mm-dd)
 */
const dateConversion = (date) => {
  year = date.getFullYear();
  month = date.getMonth()+1;
  dt = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return year+'-' + month + '-'+dt;
};

/**
 * Encodes a string into base64
 * @param {string} input
 * @return {string} base64 encoded string
 */
const btoa = (input ='') => {
  const str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3/4);

    if (charCode > 0xFF) {
      throw new Error('\'btoa\' failed: The string to be encoded contains characters outside of the Latin1 range.');
    }

    block = block << 8 | charCode;
  }

  return output;
};
/**
 * Decodes a string from base64
 * @param {string} input base64 encoded string
 * @return {string} decoded string
 */
const atob = (input = '') => {
  const str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error('\'atob\' failed: The string to be decoded is not correctly encoded.');
  }
  for (let bc = 0, bs = 0, buffer, i = 0;
    buffer = str.charAt(i++);

    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
    bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};
/**
 * Takes an array of buffers and converts to a base64 string
 * @param {array} buffer
 * @return {string} base64 string
 */
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
};


module.exports = {
  dateConversion: dateConversion,
  btoa: btoa,
  atob: atob,
  arrayBufferToBase64: arrayBufferToBase64,

};
