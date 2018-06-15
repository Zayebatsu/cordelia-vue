export default {
    methods: {
        /**
         * Converts an RGB value to HEX.
         *
         * @param {Object} rgb
         * @returns {String}
         */
        rgbTohex(rgb) {
            var hex = '#' +
                ('0' + parseInt(rgb.r,10).toString(16)).slice(-2) +
                ('0' + parseInt(rgb.g,10).toString(16)).slice(-2) +
                ('0' + parseInt(rgb.b,10).toString(16)).slice(-2);

            return hex.toUpperCase();
        },

        /**
         * Converts an RGB value to HSL.
         *
         * @param {Object} rgb
         * @returns {Object}
         */
        rgbTohsl(rgb) {
            var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
            var maxColor = Math.max(r,g,b);
            var minColor = Math.min(r,g,b);
            // calculate L:
            var l = (maxColor + minColor) / 2 ;
            var s = 0;
            var h = 0;
            if(maxColor != minColor){
                // calculate S:
                if(l < 0.5){
                    s = (maxColor - minColor) / (maxColor + minColor);
                }else{
                    s = (maxColor - minColor) / (2.0 - maxColor - minColor);
                }
                // calculate h:
                if(r == maxColor){
                    h = (g-b) / (maxColor - minColor);
                }else if(g == maxColor){
                    h = 2.0 + (b - r) / (maxColor - minColor);
                }else{
                    h = 4.0 + (r - g) / (maxColor - minColor);
                }
            }

            l = Math.round(l * 100);
            s = Math.round(s * 100);
            h = Math.round(h * 60);
            if(h<0){
                h += 360;
            }

            return {h, s, l};
        }
    }
};