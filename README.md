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
    path.to.array[10] = 10

## How it works
it use defineProperty to watch Array item updating and prototype fallback for creating new item

## limit
a MAX value is needed for a prototype fallback, and its default value is 9999, you can modify it to a reasonable one,
and only one prototype fallback will needed for efficiency

## Browsers support

the browsers witch support defineProperty



