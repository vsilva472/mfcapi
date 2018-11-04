exports.generate = ( max, zero_lead = false) => {
    const digits = Math.floor( Math.random() * Math.floor( max ) ).toString();
    const maxChars = max.toString().length;

    return zero_lead ? digits.padStart( maxChars, '0' ) : digits;
};