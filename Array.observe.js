;(function(){
//var startTime   = new Date().getTime();
    var i,
        _array              = [],
        _sign               = [],
        ArrayPrototype      = Array.prototype,
        MAX                 = 9999,//Number.MAX_VALUE,//observe array's max length, if it's too big, browser will work slow
        proto               = ObservableArray.prototype,
        defineProperty      = Object.defineProperty,
        noticeNew           = function(i, newValue){
            //console.log('new',arguments,this)
            this.notification.call(this,{
                "name"      : i,
                "object"    : this,
                "type"      : "new",
                "value"     : newValue
            })
        },
        noticeDelete        = function(i, oldValue){
            //console.log('delete',arguments,this)
            this.notification.call(this,{
                "name"      : i,
                "object"    : this,
                "type"      : "deleted",
                "oldValue"  : oldValue
            })
        },
        noticeUpdated       = function(i, oldValue, newValue){
            //console.log('updated',arguments,this)
            this.notification.call(this,{
                "name"      : i,
                "object"    : this,
                "type"      : "updated",
                "oldValue"  : oldValue,
                "value"     : newValue
            })
        },
        genGetterSetter     = function(i){
            try{
                defineProperty(this,i,{
                    get: (function(i){
                        return function(){//get value
                            return _array[i];
                        }
                    })(i),
                    set: (function(i){
                        return function(value){//trigger updated
                            noticeUpdated.call(this, i, _array[i],value);
                            _array[i]   = value;
                        }
                    })(i)
                })
            }catch(e){}
        },
        newItem             = function(i,value){
            genGetterSetter.call(this,i);
            noticeNew.call(this,i,value);
        },
        noticeAllDelete = function(){
            var self = this,
                index;
            for(index in _array){
                console.log(index)
                noticeDelete.call(self, Number(index), _array[index]);
            }
        },
        noticeAllNew = function(){
            var self = this,
                index;
            for(index in _array){
                newItem.call(self, Number(index), _array[index]);
            }
        };

    function ObservableArray(array,callback){
        _array  = array;
        this.notification = callback;
        noticeAllNew.call(this);
    }

    var i = MAX;
    while(i--){
        var b = i;
        defineProperty(proto,i,{//[i]
            /*get: (function(i){
                return function(){//fallback for initial get
                    //console.log('get',i);
                    console.log('****************',arguments)
                    //after new is delete
                    if(_sign[i]){
                        //noticeDelete(_array[i]);//delay noticeDelete
                    }
                    return _array[i];
                }
            })(i),*/
            set: (function(i){
                return function(value){//fallback to trigger new
                    //console.log('set',i,arguments);
                    //set getter setter for newItem
                    //new
                    newItem.call(this, i, value)
                    _sign[i]    = true;
                    _array[i]   = value;
                }
            })(i)
        });
    }

//var endTime   = new Date().getTime();
    /*
     * method without notice new,updated,delete
     */
    var arr = ['slice','concat','join','toSource','toString','toLocaleString','valueOf'],
        index,item;
    for(index in arr){
        item = arr[index];
        proto[item] = (function(item){
            return function(){
                //console.log('buid-in method',item);
                return ArrayPrototype[item].apply(_array,arguments);
            }
        })(item);
    };
    /*
     * =pop
     */
    proto.pop = function(){
        //console.log('buid-in method','pop');
        //
        var i = _array.length - 1;
        //notice delete
        noticeDelete.call(this, i, _array[i]);
        return ArrayPrototype.pop.apply(_array,arguments);
    }
    /*
     * =push
     */
    proto.push = function(){
        //console.log('buid-in method','push');
        //set getter setter for newItem
        var i   = _array.length;
        //notice new
        newItem.call(this, i, arguments[0]);
        return ArrayPrototype.push.apply(_array,arguments);
    }
    /*
     * =reverse
     */
    proto.reverse = function(){
        //console.log('buid-in method','reverse');
        noticeAllDelete.call(this);
        var result = ArrayPrototype.reverse.apply(_array,arguments);
        noticeAllNew.call(this);
        return result;
    }
    /*
     * =shift
     */
    proto.shift= function(){
        //console.log('buid-in method','shift');
        //notice delete
        noticeDelete.call(this, 0, _array[0]);
        return ArrayPrototype.shift.apply(_array,arguments);
    }
    /*
     * =sort
     */
    proto.sort= function(){
        //console.log('buid-in method','sort');
        noticeAllDelete.call(this);
        var deleteItem = ArrayPrototype.sort.apply(_array,arguments);
        noticeAllNew.call(this);
        //notice delete
        return deleteItem;
    }
    /*
     * =splice
     */
    proto.splice= function(){
        //console.log('buid-in method','splice');
        var insert  = Array.prototype.slice.call(arguments, 2),
            deleted = Array.prototype.splice.apply(_array, arguments),
            self    = this,
            index;
        for(index in deleted){
            //notice delete
            noticeDelete.call(self, index, deleted[index]);
        };
        for(index in insert){
            //notice add
            newItem.call(self, index, insert[index]);
        };
        return deleted;
    }
    /*
     * =unshift
     */
    proto.unshift= function(){
        //console.log('buid-in method','unshift');
        //notice add
        var length = Array.prototype.unshift.apply(_array, arguments);
        noticeAllNew.call(this);
        return length;
    }
    /*
     * test
     *
    var a = new ObservableArray([1,2,3],function(change){
        console.log(change)
    });
    a[3]    = 'val';
    a[3]    = 'update';
    a.push('push');
    console.log(a[3],a[4]);
    console.log(a.pop());
    a.push('push2');
    a.reverse();
    console.log(a.shift());
    a.push(1);
    a.push(3);
    a.push(0);
    a.sort();
    a.splice(2,1,'splice');
    a.unshift('unshift');
    console.log(a.slice(1))
    console.log(a.concat([3]))//return a new normal array
    console.log(a.join(' '))
    console.log(a.toString())
    console.log(a.toLocaleString())
    console.log(a.valueOf())
    console.log(a)
    /**/
    /*
     * ArrayObserve
     * ArrayObserve and prop must in the same scope
     */
    function ArrayObserve(obj, prop, callback){
        //var array   = parent[prop],
        //    oa      = new ObservableArray(array,callback);
        //console.log(parent,prop,a)
        //a = new ObservableArray(a, callback);
        //console.log(this)
        //eval("console.log(prop,"+prop+")")
        //eval(prop+"= new ObservableArray("+prop+",callback)");

        //var caller  = arguments.callee.caller;
        //set getter setter for parent
        //delete arr
        //if(caller == null){//window
        //}else{//function
        //}
        obj[prop]   = new ObservableArray(obj[prop],callback);
        //var arr     = parent[name],
        //    _arr    = [],
        //    observeArray    = new ObservableArray(function(change){
        //    });
        //Object.defineProperty(parent,name,{
        //    get: function(){
        //        return observeArray;
        //    },
        //    set: function(){//arr =
        //        //notice new
        //    }
        //})
        //no need to observe a it self as Object.observe do
    }
    //window.ObservableArray = ObservableArray;
    window.ArrayObserve = ArrayObserve;
    //console.log(endTime - startTime)
})()

/*
 * test
 *
var path = {
    to:{
        array:[]
    }
}
ArrayObserve('path.to.array',function(change){
    console.log(change)
})
path.to.array[10] = 10

/**
 *
var a = [1,2,3],
    c;
function b(){
    Object.defineProperty(arguments,'length',{
        get: function(){
            console.log('get')
        },
        set: function(){
            console.log('set')
        }
    })
    arguments[0] = 4;
    arguments[6] = 6;
    arguments[10] = 10
    a = arguments;
    //console.log(arguments)
};
(function(){
    arguments[10] = 1;
})();
b.apply(this,a);
a[20] = 20;
delete a[1]
console.log(a);
/**/
