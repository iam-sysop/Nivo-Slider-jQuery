/*
 * jQuery Nivo Slider v3.3.2
 * https://github.com/thecarnie/Nivo-Slider-Jquery
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

/* 
 * Now maintained at Github.com:
 * https://github.com/thecarnie/Nivo-Slider-jQuery
 *
 * see changelog for update accredidations
 */



(function($) {
    var NivoSlider = function(element, options){
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element)
            .data('nivo:vars', vars)
            .addClass('nivoSlider')
        
            // Add listeners
            .on('slideto.nivoslider', function(e, index) {
                if(vars.running || $(this).hasClass('active')) {
                    return false;
                }
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.getImageSrc());
                vars.currentSlide = index - 1;
                nivoRun(slider, kids, settings, 'control');
            }).on('slideprev.nivoslider', function(e) {
                if(vars.running) {
                    return false;
                }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                // fire new callback for previous navigation
                settings.onPrevSlide.call(this, vars.currentSlide, vars, options);

                nivoRun(slider, kids, settings, 'prev');
            }).on('slidenext.nivoslider', function(e) {
                if(vars.running) {
                    return false;
                }
                clearInterval(timer);
                timer = '';
                // fire new callback for next navigation
                settings.onNextSlide.call(this, vars.currentSlide, vars, options);

                nivoRun(slider, kids, settings, 'next');
            });
        
        // Find our slider children
        var kids = slider
            .children()
            .each(function() {
                var child = $(this);
                if(!child.is('img')){
                    if(child.is('a')){
                        child.addClass('nivo-imageLink').css('display','none');
                    }
                    child = child.find('img:first');
                }

                child.css('display','none');
                vars.totalSlides++;
            });
         
        // If randomStart
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        // Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        
        // Get initial image
        var currentKid = kids.eq(vars.currentSlide);
        if(currentKid.is('img')) {
            vars.currentImage = currentKid;
        } else {
            vars.currentImage = currentKid.find('img:first');
        }
        
        // Show initial link
        if(currentKid.is('a')){
            currentKid.css('display','block');
        }
        
        // Set first background
        var sliderImg = $('<img/>')
            .addClass('nivo-main-image')
            .attr({
                src: vars.currentImage.getImageSrc(),
                alt: vars.currentImage.attr('alt')
            })
            .show()
            .appendTo(slider);


        // Detect Window Resize
        $(window).resize(function() {
            slider.find('.nivo-slice, .nivo-box').remove();
            slider.children('img').width(slider.width());
            sliderImg.attr({
                    src: vars.currentImage.getImageSrc(),
                    alt: vars.currentImage.attr('alt')
                })
                .stop()
                .height('auto');
        });

        //Create caption
        slider.append('<div class="nivo-caption"></div>');
        
        // Process caption function
        var processCaption = function(settings){
            var nivoCaption = slider.find('.nivo-caption');
            var title = vars.currentImage.attr('title');
            if(typeof title !== 'undefined' && title !== ''){
                if(title.substr(0,1) === '#') title = $(title).html();

                if(nivoCaption.css('display') === 'block'){
                    setTimeout(function(){
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        };
        
        //Process initial  caption
        processCaption(settings);
        
        //Process afterInit Callback (passes currentSlide Index just before slideshow autoplay starts)
        settings.afterInit.call(this, vars.currentSlide, vars, options);

        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(
                function() {
                    nivoRun(slider, kids, settings, false);
                },
                settings.pauseTime
            );
        }

        
        // Add Direction nav
        if(settings.directionNav){
            slider
                .append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>')
                .on('click', 'a.nivo-prevNav', function(){
                    slider.trigger('slideprev.nivoslider');
                })
                .on('click', 'a.nivo-nextNav', function(){
                    slider.trigger('slidenext.nivoslider');
                });
        }
        
        // Add Control nav
        if(settings.controlNav){
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>')
                .insertAfter(slider);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if(child.attr('data-thumb')) {
                        vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('data-thumb') +'" alt="" /></a>');
                    }
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
                }
            }

            //Set initial active link
            vars.controlNavEl.find('a:eq('+ vars.currentSlide +')', ).addClass('active');
            
            vars.controlNavEl.on('click', 'a', function(){
                slider.trigger('slideto.nivoslider', [ $(this).attr('rel') ]);
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // Restart the timer
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        // Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr({
                src: vars.currentImage.getImageSrc(),
                alt: vars.currentImage.attr('alt')
            });
            vars.running = false; 
            // Hide child links
            kids.filter('a').css('display','none');

            // Show current link
            kids.eq(vars.currentSlide).filter('a').css('display','block');

            // Restart the timer
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this, vars.currentSlide, vars, options);

        }); 
        
        // Add slices for slice animations
        var createSlices = function(slider, settings, vars) {
            vars.currentImage.parent().filter('a').css('display','block');
            var image = slider
                .find('img[src="'+ vars.currentImage.attr('src') +'"]')
                .not('.nivo-main-image,.nivo-control img')
                .width(slider.width())
                .css('visibility', 'hidden')
                .show();
            var sliceHeight = image.parent().is('a') ? image.parent().height() : image.height();

            for(var i = 0; i < settings.slices; i++){
                var sliceWidth = Math.round(slider.width()/settings.slices);

                $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.getImageSrc() +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({
                    left:(sliceWidth*i)+'px',
                    width: ((i === settings.slices - 1) ? slider.width() - (sliceWidth*i) : sliceWidth ) +'px',
                    height: sliceHeight + 'px',
                    opacity:'0',
                    overflow:'hidden'
                }).appendTo(slider);
            }
            
            //$('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({ height: vars.currentImage.height() }, settings.animSpeed);
        };
        
        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars){
            vars.currentImage.parent().filter('a').css('display','block');
            var image = slider
                .find('img[src="'+ vars.currentImage.attr('src') +'"]')
                .not('.nivo-main-image,.nivo-control img')
                .width(slider.width())
                .css('visibility', 'hidden')
                .show();
            var boxWidth = Math.round(slider.width()/settings.boxCols),
                boxHeight = Math.round(image.height() / settings.boxRows);
            
                        
            for(var rows = 0; rows < settings.boxRows; rows++){
                for(var cols = 0; cols < settings.boxCols; cols++){
                    $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.getImageSrc() +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({
                        opacity:0,
                        left:(boxWidth*cols)+'px',
                        top:(boxHeight*rows)+'px',
                        width: ((cols === settings.boxCols - 1) ? (slider.width()-(boxWidth*cols)) : boxWidth ) + 'px'
                    })
                        .appendTo(slider)
                        .height(slider.find('.nivo-box[name="'+ cols +'"] img').height());
                }
            }
            
            sliderImg.stop().animate({ height: $(vars.currentImage).height() }, settings.animSpeed);
        };

        // Private run method
        var nivoRun = function(slider, kids, settings, nudge){          
            // Get our vars
            var vars = slider.data('nivo:vars');
            
            // Trigger the lastSlide callback       
            if(vars && (vars.currentSlide === vars.totalSlides - 1 && !vars.stop)){
                settings.lastSlide.call(this, vars.currentSlide, vars, options);
            }

            // Stop
            if((!vars || vars.stop) && !nudge) { return false; }
            
            // Trigger the beforeChange callback
            settings.beforeChange.call(this, vars.currentSlide, vars, options);

            // Set current background before change
            if(!nudge){
                settings.onNextSlide.call(this);
            }
            if (!nudge || nudge === 'prev' || nudge === 'next'){
                sliderImg.attr({
                    src: vars.currentImage.getImageSrc(),
                    alt: vars.currentImage.attr('alt')
                });
            }
                        
            ++ vars.currentSlide;
            // Trigger the slideshowEnd callback
            if(vars.currentSlide === vars.totalSlides){ 
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this, vars.currentSlide, vars, options);

            } else if(vars.currentSlide < 0) {
                vars.currentSlide = vars.totalSlides - 1;
            }

            // Set vars.currentImage
            var currentChild = kids.eq(vars.currentSlide);
            if(currentChild.is('img')) {
                vars.currentImage = currentChild;
            } else {
                vars.currentImage = currentChild.find('img:first');
            }
            
            // Set active links
            if(settings.controlNav){
                vars.controlNavEl
                    .find('a')
                    .removeClass('active')
                    .eq(vars.currentSlide)
                    .addClass('active');
            }
            
            // Process caption
            processCaption(settings);            
            
            // Remove any slices and boxes from last transition
            slider.find('.nivo-slice, .nivo-box').remove();
            
            var currentEffect = settings.effect,
                anims = '';
                
            // Generate random effect
            if(settings.effect === 'random'){
                anims = ['sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse'];
                currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') !== -1){
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
                currentEffect = vars.currentImage.attr('data-transition');
            }
        
            // Run effects
            vars.running = true;
            var totalBoxes = '',
                boxes = '';
            
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'
                || currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'
            ){
                createSlices(slider, settings, vars);
                var slices = slider.find('.nivo-slice');
                if(currentEffect === 'sliceDownLeft' || currentEffect === 'sliceUpLeft'
                    || currentEffect === 'sliceUpDownLeft'
                ) {
                    slices = slices._reverse();
                }
                
                slices.each(function(i){
                    var slice = $(this);
                    if (currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight'
                        || currentEffect === 'sliceDownLeft' ||
                        (
                            (currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight'
                                || currentEffect === 'sliceUpDownLeft'
                            )
                            && i % 2 === 0
                        )
                    ) {
                        slice.css({ 'top': '0px' });
                    } else {
                        slice.css({ 'bottom': '0px' });
                    }

                    setTimeout(
                        function() {
                            slice.animate(
                                {opacity: '1.0'},
                                settings.animSpeed,
                                '',
                                function() {
                                    if (i === settings.slices - 1) {
                                        slider.trigger('nivo:animFinished');
                                    }
                                }
                            );
                        },
                        100 + 50 * i
                    );
                });
            } else if(currentEffect === 'fold'){
                createSlices(slider, settings, vars);

                slider.find('.nivo-slice', ).each(function(i) {
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({ top:'0px', width:'0px' });
                    setTimeout(
                        function() {
                            slice.animate(
                                { width: origWidth, opacity: '1.0'},
                                settings.animSpeed,
                                '',
                                function() {
                                    if (i === settings.slices - 1) {
                                        slider.trigger('nivo:animFinished');
                                    }
                                }
                            );
                        },
                        100 + 50 * i
                    );
                });
            } else if(currentEffect === 'fade'){
                createSlices(slider, settings, vars);
                
                slider
                    .find('.nivo-slice:first')
                    .css({
                        'width': slider.width() + 'px'
                    })
                    .animate(
                        { opacity:'1.0'},
                        settings.animSpeed * 2,
                        '',
                        function() {
                            slider.trigger('nivo:animFinished');
                        }
                    );
            } else if(currentEffect === 'slideInRight'){
                createSlices(slider, settings, vars);

                slider
                    .find('.nivo-slice:first')
                    .css({
                        'width': '0px',
                        'opacity': '1'
                    })
                    .animate(
                        { width: slider.width() + 'px' },
                        settings.animSpeed * 2,
                        '',
                        function() {
                            slider.trigger('nivo:animFinished');
                        }
                    );
            } else if(currentEffect === 'slideInLeft'){
                createSlices(slider, settings, vars);

                var firstSlice = slider
                    .find('.nivo-slice:first')
                    .css({
                        'width': '0px',
                        'opacity': '1',
                        'left': '',
                        'right': '0px'
                    })
                    .animate(
                        { width: slider.width() + 'px' },
                        settings.animSpeed * 2,
                        '',
                        function() {
                            // Reset positioning
                            firstSlice.css({
                                'left': '0px',
                                'right': ''
                            });
                            slider.trigger('nivo:animFinished');
                        }
                    );
            } else if(currentEffect === 'boxRandom'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;

                boxes = shuffle(slider.find('.nivo-box'));
                boxes.each(function(i){
                    var box = $(this);
                    setTimeout(
                        function() {
                            box.animate(
                                {opacity: '1.0'},
                                settings.animSpeed,
                                '',
                                function() {
                                    if (i === totalBoxes - 1) {
                                        slider.trigger('nivo:animFinished');
                                    }
                                }
                            );
                        },
                        100 + 20 * i
                    );
                });
            } else if(currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                var i = 0;
                var timeBuff = 0;
                
                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', slider);
                if(currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse'){
                    boxes = $('.nivo-box', slider)._reverse();
                }
                boxes.each(function(){
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if(colIndex === settings.boxCols){
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });
                
                // Run animation
                for(var cols = 0; cols < (settings.boxCols * 2); cols++){
                    var prevCol = cols;
                    for(var rows = 0; rows < settings.boxRows; rows++){
                        if(prevCol >= 0 && prevCol < settings.boxCols){
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function(row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
                                if(i === totalBoxes-1){
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3, '', function(){ slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }           
        };
        
        // Shuffle an array
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        
        // For debugging
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        
        this.slideTo = function(index){
            $(element).trigger('slideto.nivoslider', [ index ]);
        };
        
        this.slidePrev = function() {
            $(element).trigger('slideprev.nivoslider');
        };
        
        this.slideNext = function() {
            $(element).trigger('slidenext.nivoslider');
        };
        
        // Trigger the afterLoad callback
        settings.afterLoad.call(this, vars, options);
        
        return this;
    };
        
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };
    
    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 500,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function(){},     // function(slideIndex, runtimeVars, options)
        afterChange: function(){},      // function(slideIndex, runtimeVars, options)
        slideshowEnd: function(){},     // function(slideIndex, runtimeVars, options)
        lastSlide: function(){},        // function(slideIndex, runtimeVars, options)
        afterInit: function(){},        // function(slideIndex, runtimeVars, options)
        afterLoad: function(){},        // function(runtimeVars, options)
        onPrevSlide: function(){},      // function(slideIndex, runtimeVars, options)
        onNextSlide: function(){}       // function(slideIndex, runtimeVars, options)

    };

    $.fn._reverse = [].reverse;

    $.fn.getImageSrc = function () {
        return typeof this.prop('currentSrc') !== 'undefined' ? this.prop('currentSrc') : this.attr('src');
    }
    
})(jQuery);