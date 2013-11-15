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
it use defineProperty to watch Array item updating and prototype fallback for creating new item

## limit

 * a MAX value is needed for a prototype fallback, and its default value is 9999, you can modify [it](https://github.com/defims/Array.observe/blob/master/Array.observe.js#L19) to a reasonable one,
and only one prototype fallback will needed for efficiency.
 * use the delete command to delete Array item will not trigger observe,and it seems only rolling can solve this.

## Browsers support

the browsers which support defineProperty

## roadmap

 * it seems dataset will async dom and property, and [support table](http://caniuse.com/#search=dataset) seems fine, so dataset will be added for delete command detect.
 * 9999 max limit will be solve with better solution
