/*
 * jQuery stickyheader 12/11/2014
 * 
 * Copyright (c) 2014 Gavin Matthews
 * Dual licensed under the MIT and GPL licenses.
 */
 $(function(){
	$.fn.stickyheader = function(method) {

		// Plugin default options
		var defaults = {
			height: 150,
			zIndex: 100,
			stickyTheadCss: {},
			stickyWrapCss: {},
			headerEvents: "click"
		};


		var settings  = {};

		var methods = 
		{
		      init: function (options) {
		        settings = $.extend({}, defaults, options);

		        if (!(/d*(%|px)$/.test(settings.height))) {
		        	settings.height = settings.height + "px";
		        }


				var stickyTheadCssDefault = {
					'opacity': '0',
					'position': 'absolute',
					'top': '0',
					'left': '0',
					'box-shadow': '0 0.25em 0.1em -0.1em rgba(0,0,0,.125)',
					'z-index': settings.zIndex,
					'width': '100%' /* Force stretch */
				};

				var stickyWrapCssDefault = {
					'overflow-x': 'auto',
					'overflow-y': 'auto',
					'position': 'relative',
					'margin': '3em 0',
					'width': '100%',
					'max-height': settings.height
				}

		        settings.stickyTheadCss = $.extend({}, stickyTheadCssDefault, options.stickyTheadCss);
		        settings.stickyWrapCss = $.extend({}, stickyWrapCssDefault, options.stickyWrapCss);


		        // iterate through all the DOM elements we are attaching the plugin to
		        return this.each(function () {
					var $self = $(this); // reference the jQuery version of the current DOM element

					if (isTable($self)) {
						setup.apply(this, Array.prototype.slice.call(arguments, 1));
					} else {
						$.error('Invalid table mark-up');
					}
		        });
		    }
		};

	  	/****************************
	  	 * Private functions
	  	 ****************************/

	  	 // Set the table up with sticky header
	  	 function setup() {
			var $table = $(this);
			var sticky = updateDom($table);
			
			var onResize = $.debounce(1, function() {
					setWidths($table, sticky);
					repositionStickyHead($table, sticky);
				});

			var onLoad = function() {
				setWidths($table, sticky);

				if($table.height() > sticky.$wrap.height()) {
					// IE 8/9 don't like max-height here
					sticky.$wrap.css({
						height : sticky.$wrap.height() + 'px'
					})
				}
			}

			$(window).load(onLoad).resize(onResize);
		}

	  	// Check if the object is a supported table.
	  	function isTable($obj) {
	  		return $obj.is('table') &&
	  		  	$obj.find('thead').length > 0 &&
	  		  	$obj.find('tbody').length > 0;
	  	}

	  	function bindTheadEvents(events, $origThead, $thead) {
	  		// Get the original element from the clicked clone
	  		var getOrig = function($cloned) {
	  			var $origTarget = $origThead;
	  			var $lastCloneParent = $thead;
				var $clonedParents = $cloned.add($cloned.parentsUntil("thead"));

				for (var i = 0; i < $clonedParents.length; ++i) {
					var currentClone = $clonedParents.get(i);
					var clonedIndex = $lastCloneParent.children().index(currentClone);
					$origTarget = $origTarget.children().eq(clonedIndex);
					$lastCloneParent = $(currentClone);
				}
				return $origTarget;
	  		}

			$thead.bind(events, function(e) {
				e.preventDefault();
				getOrig($(e.target)).trigger(e.type);
	  		});
	  	}

	  	// Wrap the table and add the pinned header.
	  	function updateDom($table) {
	  		var $origThead = $table.find('thead');
	  		var $thead = $origThead.clone();

	  		bindTheadEvents(settings.headerEvents, $origThead, $thead);

	  		// Add class, remove margins, reset width and wrap table
			$table.addClass('sticky-enabled').css({
				margin: 0,
				width: '100%'
			}).wrap('<div class="sticky-wrap" />');

			if($table.hasClass('overflow-y')) {
				$table.removeClass('overflow-y').parent().addClass('overflow-y');
			}

			// Create new sticky table head
			$table.after('<table class="sticky-thead" />');

			var $stickyHead  = $table.siblings('.sticky-thead'),
				$stickyWrap  = $table.parent('.sticky-wrap');

			$stickyWrap.css(settings.stickyWrapCss);
			$stickyHead.css(settings.stickyTheadCss).append($thead);
			$thead.find('th').css('box-sizing', 'border-box');

			var sticky = {
				$head : $stickyHead,
				$wrap : $stickyWrap
			};

			$stickyWrap.scroll($.throttle(1, function() {
				repositionStickyHead($table, sticky);
			}));

			return sticky;
	  	}

	  	// Handle resizing.
		function setWidths($table, sticky) {
			var $stickyWrap = sticky.$wrap;
			var $stickyHead = sticky.$head;

			$table.find('thead th').each(function (i) {
				$stickyHead.find('th').eq(i).width($(this).width());
			});

			$stickyHead.width($table.width());
		}

		// Move the header as the table scrolls.
		function repositionStickyHead($table, sticky) {
			var $stickyWrap = sticky.$wrap;
			var $stickyHead = sticky.$head;

			// Pinning only applies if table is bigger than window.
			if($table.height() > $stickyWrap.height()) {
				// Pinned header is only visible if top has scrolled off-screen
				if($stickyWrap.scrollTop() > 0) {
					$stickyHead.css({
						opacity: 1,
						top: $stickyWrap.scrollTop()
					});
				} else {
					$stickyHead.css({
						opacity: 0,
						top: 0
					});
				}
			}
		}

	  	
	
		// if a method as the given argument exists
    	if (methods[method]) {
    	    // call the respective method
    	    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

    	// if an object is given as method OR nothing is given as argument
    	} else if (typeof method === 'object' || !method) {
    		// call the initialization method
    		return methods.init.apply(this, arguments);
    	// otherwise
    	} else {
    	    // trigger an error
      		$.error('Method "' +  method + '" does not exist in fixedHeaderTable plugin!');
    	}

	};
});