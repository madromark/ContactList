var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity: 'contact',
    connection: 'disk',
    attributes: {
        nev: {
            type: 'string',
            required: true
        },
        telszam: 'string',
        mail: 'string',
        szuldatum: 'date',
        user: {
            model: 'user'
        }
    }
});