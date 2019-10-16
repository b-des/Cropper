# Cropper.js
Front-end library for image manipulation

## Installation
Just include the file named 'main.js' from dist directory to your website, before closing body tag.

Also for correct working of some functions, you need to add(if it has not been done before) popper.min.js script to your website:
````
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.4/umd/popper.min.js"></script>
````

And if you will use it on mobile devices you need to add this script:
````
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
````

Since the module depends on jQuery, it is necessary to add it after jQuery library in document.

## Usage
Define in your document html container:
```html
<div id="cropper-container"></div>
```

Then use constructor for create library instance:

```javascript
let c = new Cropper({
    container: 'cropper-container',
    handlerUrl: 'http://YOUR_IP:SERVER_PORT',
    dest: ['var/www/YOUR_SITE','uploads/images'],
});
```

At that point, the module is initialized and running.
See docs for more information.
