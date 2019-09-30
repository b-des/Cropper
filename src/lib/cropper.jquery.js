export default (function ( $ ) {

    $.fn.cropper = function( options ) {
        console.log(this);

        // Default options
        let settings = $.extend({
            name: 'John Doe'
        }, options );

        // Apply options
        return this.append('Hello ' + settings.name + '!');

    };

}( jQuery ));


