
# remember

  Use localstorage to remember input values. Supports textareas and inputs including radio buttons and checkboxes.

## Example

```js
var remember = require('remember');

remember()
  .except('input[type=password]');
```

## Installation

    $ component install matthewmueller/remember

## Design

This library uses document-level event delegation to capture input. This allows for efficient and "live" bindings. The caveat to this approach is that if you use `e.stopPropagation()` within another input binding, remember's bindings will not trigger and the input will not be saved.

## API

### `Remember([options])`

Initializes remember and pulls in the previously stored values. Options include:

* `namespace`: used to namespace the values in localstorage. Defaults to `remember:`.

### `.except(selector)`

Excludes elements that match the selector.

### `.clear()`

Clears localstorage

### `.unbind()`

Unbinds all textareas and inputs.

## License

  MIT
