if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

;(function(){

    var i,
        _array              = [],
        _sign               = [],
        ArrayPrototype      = Array.prototype,
        MAX                 = 90,//Number.MAX_VALUE,//observe array's max length
        proto               = ObserveArray.prototype,
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
                            noticeUpdated.call(this, i, _array[i]);
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
            var self = this;
            _array.forEach(function(item, index, array){
                //notice delete
                noticeDelete.call(self, index, item);
            });
        },
        noticeAllNew = function(){
            var self = this;
            _array.forEach(function(item, index, array){
                //new item
                newItem.call(self, index,item)
            });
        };

    function ObserveArray(array,callback){
        _array  = array;
        this.notification = callback;
        noticeAllNew.call(this);
    }

    for(i=0;i<MAX;i++)    defineProperty(proto,i,{//[i]
        get: (function(i){
            return function(){//fallback for initial get
                //console.log('get',i);
                //after new is delete
                if(_sign[i]){
                    //noticeDelete(_array[i]);//delay noticeDelete
                }
                return _array[i];
            }
        })(i),
        set: (function(i){
            return function(value){//fallback to trigger new
                //console.log('set',i,arguments);
                //set getter setter for newItem
                console.log(arguments,this)
                //new
                newItem.call(this, i, value)
                _sign[i]    = true;
                _array[i]   = value;
            }
        })(i)
    });
    /*
     * method without notice new,updated,delete
     */
    ['slice','concat','join','toSource','toString','toLocaleString','valueOf'].forEach(function(item, index, array){
        proto[item] = (function(item){
            return function(){
                //console.log('buid-in method',item);
                return ArrayPrototype[item].apply(_array,arguments);
            }
        })(item);
    });
    /*
     * =pop
     */
    proto.pop = function(){
        //console.log('buid-in method','pop');
        //
        var i = _array.length;
        //notice delete
        noticeDelete.call(this, i, _array[i-1]);
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
            self    = this;
        deleted.forEach(function(item, index, array){
            //notice delete
            noticeDelete.call(self, index, item);
        });
        insert.forEach(function(item, index, array){
            //notice add
            newItem.call(self, index, item);
        });
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
    var a = new ObserveArray([1,2,3],function(change){
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
    /**/

    function ArrayObserve(array, callback){
        //var caller  = arguments.callee.caller;
        //set getter setter for parent
        //delete arr
        //if(caller == null){//window
        //}else{//function
        //}
        /*
        var arr     = parent[name],
            _arr    = [],
            observeArray    = new ObserveArray(function(change){
            });
        Object.defineProperty(parent,name,{
            get: function(){
                return observeArray;
            },
            set: function(){//arr =
                //notice new
            }
        })*/
        //no need to observe a it self as Object.observe do
    }
    //console.log(ObserveArray)
    //var a = [];
    //ArrayObserve(a,function(change){
    //    console.log(change)
    //})


})()

