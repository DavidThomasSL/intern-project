/* ===============================================================================
 * alton.js v1.0
 * ===============================================================================
 * Copyright 2014 Paper Leaf Design
 * http://www.paper-leaf.com
 *
 * Author: Paper Leaf
 *
 * A full featured scrolling plugin for creating
 * immersive featured sections or headers.
 *
 * Credit:
 * is_mobile() based off these helpful posts
 * - http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
 *
 * Getting stable scroll events was helped hugely by Huge Inc's insights
 * - http://www.hugeinc.com/ideas/perspective/scroll-jacking-on-hugeinc
 *
 * Stabilizing keypress events was helped in large part by jQuery OnePage Scroll
 * - https://github.com/peachananr/onepage-scroll
 *
 * License: GPL v3
 * =============================================================================== */

(function ($) {
    /* ===============================================================================
     * Table of Contents
     * -------------------
     *
     * 1. Default Options
     * 2. Global Variables
     * 3. Initiate Layout
     * 4. Mobile Device Check
     * 5. Click to Navigate
     * 6. Update Position
     * 7. Move Up
     * 8. Move Down
     * 9. Prevent Default Animations
     * 10. Scroll To
     * 11. Featured Scroll
     * 12. Header Scroll
     *
     * =============================================================================== */

    /* =============================================================================
     * Default Options
     * -------------------
     * Creating defaults in case the user doesn't feel like adding their own
     * ============================================================================= */
    "use strict";
    var defaults = {
            firstClass : 'header', // classname of the first element in your page content
            fullSlideContainer : 'full', // full page elements container for
            singleSlideClass : 'slide', // class for each individual slide
            nextElement : 'div', // set the first element in the first page series.
            previousClass : null, // null when starting at the top. Will be updated based on current postion
            lastClass: 'footer', // last block to scroll to
            slideNumbersContainer: 'slide-numbers', // ID of Slide Numbers
            bodyContainer: 'pageWrapper', // ID of content container
            scrollMode: 'featuredScroll', // Choose scroll mode
            useSlideNumbers: false, // Enable or disable slider
            slideNumbersBorderColor: '#fff', // outside color for slide numbers
            slideNumbersColor: '#000', // interior color when slide numbers inactive
            animationType: 'slow' // animation type: currently doesn't do anything
        };

    $.fn.alton = function (options) {
        /* =============================================================================
         * User Settings
         * -------------------
         * Update the default settings with user selected options
         * ============================================================================= */
        var settings = $.extend(true, {}, defaults, options),

            /* =============================================================================
             * Global Variables
             * -------------------
             * Setting up variables that will be used throught the plugin
             * ============================================================================= */
            singleSlideClass = settings.singleSlideClass,
            singleSlide,
            bodyScroll,
            down = false,
            up = false,
            current,
            next = $('.' + singleSlideClass + ':first'),
            previous = null,
            last = $('.' + settings.lastClass),
            projectCount = $('.' + settings.fullSlideContainer).children().length,
            slideNumbers,
            top = true,
            upCount = 0,
            downCount = 0,
            windowHeight = $(window).outerHeight(),
            animating = false,
            docElem = window.document.documentElement,
            scrollOffset,
            i;

        // IE8 Support for getElementsByClassname
        if ('getElementsByClassName' in document) {
            singleSlide = document.getElementsByClassName(singleSlideClass);
        } else {
            singleSlide = document.querySelectorAll('.' + singleSlideClass);
        }

        if ($('.' + settings.firstClass).length > 0) {
            current = $('.' + settings.firstClass); // current element is the topmost element
        } else {
            previous = null;
            current = next;
            next = current.next();
            last = $('.' + singleSlideClass + ':last-child')[0];
        }


        /* ============================================================================
         * Initiate Layout
         * -------------------
         * Get the slides to 100% height, and add pagination
         * ============================================================================ */
        function initiateLayout(style) {
            if (style === 'featuredScroll') {
                for (i = singleSlide.length - 1; i >= 0; i -= 1) {
                    $(singleSlide[i]).css('height', windowHeight);
                    $(singleSlide[i]).outerHeight(windowHeight);
                }
                if (settings.useSlideNumbers && !is_mobile()) {
                    // Create Slider Buttons
                    $('.' + settings.bodyContainer).append('<div id="' + settings.slideNumbersContainer + '"></div>');
                    $('#' + settings.slideNumbersContainer).css({
                        'height': '100%',
                        'position': 'fixed',
                        'top': 0,
                        'right': '0px',
                        'bottom': '0px',
                        'width': '86px',
                        'z-index': 999
                    });
                    $('.' + settings.bodyContainer + ' #' + settings.slideNumbersContainer).append('<ul></ul>');
                    $('.' + settings.bodyContainer + ' #' + settings.slideNumbersContainer + ' ul').css({
                        'transform': 'translateY(-50%)',
                        '-moz-transform': 'translateY(-50%)',
                        '-ms-transform': 'translateY(-50%)',
                        '-o-transform': 'translateY(-50%)',
                        '-webkit-transform': 'translateY(-50%)',
                        'top': '50%',
                        'position': 'fixed'
                    });

                    var testCount = 0;

                    while (testCount < projectCount) {
                        $('.' + settings.bodyContainer + ' #' + settings.slideNumbersContainer + ' ul').append('<li class="paginate"></ul>');
                        if (msieversion()) {
                            $('.paginate').css({
                                'cursor':'pointer',
                                'border-radius':'50%',
                                'list-style': 'none',
                                'background': settings.slideNumbersBorderColor,
                                'border-color': settings.slideNumbersBorderColor,
                                'border-width': '2px',
                                'border-style': 'solid',
                                'height': '11px',
                                'width': '11px',
                                'margin': '5px 0'
                            });
                        } else {
                             $('.paginate').css({
                                'cursor':'pointer',
                                'border-radius':'50%',
                                'list-style': 'none',
                                'background': settings.slideNumbersBorderColor,
                                'border-color': settings.slideNumbersBorderColor,
                                'border-width': '2px',
                                'border-style': 'solid',
                                'height': '10px',
                                'width': '10px',
                                'margin': '5px 0'
                            });
                        }

                        testCount += 1;
                    }
                    // Store the slidenumbers
                    // IE8 Support for getElementsByClassname
                    if (('getElementsByClassName' in document)) {
                        slideNumbers =  document.getElementsByClassName('paginate');
                    } else {
                        slideNumbers =  document.querySelectorAll('.paginate');
                    }
                }
            } else {
                $('.'+settings.firstClass).css('height', windowHeight + 10);
                if (!$('.'+settings.firstClass).hasClass('active')) {
                    $('.'+settings.firstClass).toggleClass('active');
                    if (msieversion()) {
                        $('.paginate.active').css({
                            'margin-left': '-1px',
                            'border-color': '#' + settings.slideNumbersBorderColor,
                            'border-style': 'solid',
                            'border-width': '2px',
                            'height': '8px',
                            'width': '8px'
                        });
                    }
                }
            }
        }

        function msieversion() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) {   // If Internet Explorer, return version number
                return true;
            } else {
                return false;
            }
        }

        /* ============================================================================
         * Mobile device check
         * -------------------
         * Check if mobile device
         * ============================================================================ */
        function is_mobile() {
            return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|Windows Phone|Tizen|Bada)/);
        }


        /* ============================================================================
         * Prevent Default Animations
         * -------------------
         * Stops default scroll animations when called
         * ============================================================================ */
        function preventDefault(e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.stopPropagation();
                e.returnValue = false;
            }
        }

        function stopDefaultAnimate(event) {
            return preventDefault(event);
        }


    };
})(jQuery);
