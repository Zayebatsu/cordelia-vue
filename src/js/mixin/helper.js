export default {
    methods: {
        /**
         * Checks if a color is dark or not.
         *
         * @param {Object} rgb
         * @returns {Boolean}
         */
        isDark(rgb) {
            var {r, g, b} = rgb,
                dark = Math.round(((r * 299) +
                    (g * 587) +
                    (b * 114)) / 1000);

            return (dark > 125) ? true : false;
        },

        /**
         * Starts the opacity animation.
         *
         * @param {HTML Element} elm
         * @param {Boolean} status
         * @returns {Promise}
         */
        opacityAnimation(elm, status) {
            return new Promise(resolve => {
                var style = elm.getAttribute('style') ? elm.getAttribute('style').replace(/opacity[^;]+;?/g, '') : null,
                    start = null,
                    duration = 100;

                if(status) {
                    elm.classList.remove('cdp-hidden');
                    elm.style.opacity = 0;
                } else {
                    elm.style.opacity = 1;
                }

                function opacityAnimation(timestamp) {
                    if(!start) {
                        start = timestamp || new Date.getTime();
                    }

                    var runtime = timestamp - start,
                        progress = runtime / duration;
                    progress = Math.min(progress, 1);

                    if(runtime < duration) {
                        var value = progress;
                        if(!status) {
                            value = Math.abs(progress - 1);
                        }
                        elm.style.opacity = value;
                        window.requestAnimationFrame(opacityAnimation);
                    } else {
                        if(!status) {
                            elm.classList.add('cdp-hidden');
                        }
                        elm.setAttribute('style', style);

                        resolve();
                    }
                }
                window.requestAnimationFrame(opacityAnimation);
            });
        }
    }
};