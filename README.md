# Array.observe

## Usage

    var path = {
        to:{
            array:[]
        }
    };
    ArrayObserve('path.to.array',function(change){
        console.log(change)
    })
    path.to.array[10] = 'new one'
    //console.log Object {name: 10, object: ObserveArray, type: "new", value: "new one"}
    
    path.to.array[10] = 'update it'
    //console.log Object {name: 10, object: ObserveArray, type: "updated", oldValue: "new one", value: "update it"}

## How it works
it use defineProperty to watch Array item updating ,prototype fallback to watch Array item creating and a length watcher for Array item deleting.

## limit

 * a MAX value is needed for a prototype fallback, and its default value is 9999, you can modify [it](https://github.com/defims/Array.observe/blob/master/Array.observe.js#L124) to a reasonable one,
and only one prototype fallback will needed for efficiency.
 * use the delete command to delete Array item will not trigger observe for delete command keep the length value. it seems only rolling can solve this. use "array[2] = undefined;" instead.

## Browsers support

the [browsers](http://kangax.github.io/es5-compat-table/#Object.defineProperty) which support defineProperty.

## roadmap

 * it seems dataset will async dom and property, and [support table](http://caniuse.com/#search=dataset) seems fine, so dataset will be added for delete command detect.
 * 9999 max limit will be solve with better solution.
 * with [defineProperty polyfill](https://github.com/defims/defineProperty.polyfill) for ie6,7,8 all browsers can use ArrayObserve.
