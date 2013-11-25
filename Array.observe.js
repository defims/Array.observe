;(function(){
    var _array              = [],
        ArrayPrototype      = Array.prototype,
        MAX                 = 9999,//Number.MAX_VALUE,//observe array's max length, if it's too big, browser will work slow
        noticeNew           = function(i, newValue){
            //console.log('new',arguments,this)
            this.notification.call(this,{
                "name"      : Number(i),
                "object"    : this,
                "type"      : "new",
                "value"     : newValue
            })
        },
        noticeDelete        = function(i, oldValue){
            //console.log('delete',arguments,this)
            this.notification.call(this,{
                "name"      : Number(i),
                "object"    : this,
                "type"      : "deleted",
                "oldValue"  : oldValue
            })
        },
        noticeUpdated       = function(i, oldValue, newValue){
            //console.log('updated',arguments,this)
            this.notification.call(this,{
                "name"      : Number(i),
                "object"    : this,
                "type"      : "updated",
                "oldValue"  : oldValue,
                "value"     : newValue
            })
        },
        newItem             = function(i,value){
            _array[i] = value;
            //genGetterSetter.call(this,i);
            try{
                defineProperty(this,i,{
                   get: function(){//get value
                        return _array[i];
                    },
                    set: function(value){//trigger updated
                        noticeUpdated.call(this, i, _array[i],value);
                        _array[i]   = value;
                    }
                })
            }catch(e){}

            noticeNew.call(this,i,value);
        },
        noticeAllDelete = function(){
            var self = this,
                index;
            for(index in _array){
                console.log(index)
                noticeDelete.call(self, index, _array[index]);
            }
        },
        noticeAllNew = function(){
            var self = this,
                index;
            for(index in _array){
                newItem.call(self, index, _array[index]);
            }
        };

    function ObservableArray(array, callback){
        _array  = array;
        this.notification = callback;
        noticeAllNew.call(this);
    }
    function ObservableArrayPrototype(){
        var i               = MAX,
            defineProperty  = Object.defineProperty,
            self            = this;
        /*
         * =[i]
         */
        /*
         * Fast Duff's Device
         * @author Miller Medeiros <http://millermedeiros.com> 
         * @modify Defims Loong
         * @version 0.3 (2010/08/25)
         */
        function duff(process, iterations){
            var n   = iterations % 8,
                i   = iterations;
            while (n--) process(i--);
            n = (iterations * 0.125) ^ 0;
            while (n--) {
                process(i--);
                process(i--);
                process(i--);
                process(i--);
                process(i--);
                process(i--);
                process(i--);
                process(i--);
            };
        };
        //console.time('[i]')
        var self    = this;
        duff(function(i){
            defineProperty(self,i,{//[i]
                set: function(value){//fallback to trigger new
                    newItem.call(this, i, value);
                }
            });
        }, MAX);
        //console.timeEnd('[i]')

        /*
         * =pop
         */
        self.pop = function(){
            var i = _array.length - 1;
            noticeDelete.call(this, i, _array[i]);
            return ArrayPrototype.pop.apply(_array,arguments);
        }
        /*
         * =pop
         */
        self.pop = function(){
            var i = _array.length - 1;
            noticeDelete.call(this, i, _array[i]);
            return ArrayPrototype.pop.apply(_array,arguments);
        }
        /*
         * =push
         */
        self.push = function(){
            var i   = _array.length;
            newItem.call(this, i, arguments[0]);
            return ArrayPrototype.push.apply(_array,arguments);
        }
        /*
         * =reverse
         */
        self.reverse = function(){
            noticeAllDelete.call(this);
            var result = ArrayPrototype.reverse.apply(_array,arguments);
            noticeAllNew.call(this);
            return result;
        }
        /*
         * =shift
         */
        self.shift= function(){
            noticeDelete.call(this, 0, _array[0]);
            return ArrayPrototype.shift.apply(_array,arguments);
        }
        /*
         * =sort
         */
        self.sort= function(){
            noticeAllDelete.call(this);
            var deleteItem = ArrayPrototype.sort.apply(_array,arguments);
            noticeAllNew.call(this);
            return deleteItem;
        }
        /*
         * =splice
         */
        self.splice= function(){
            var insert  = ArrayPrototype.slice.call(arguments, 2),
                deleted = ArrayPrototype.splice.apply(_array, arguments),
                _this   = this,
                index;
            for(index in deleted){
                //notice delete
                noticeDelete.call(_this, index, deleted[index]);
            };
            for(index in insert){
                //notice add
                newItem.call(_this, index, insert[index]);
            };
            return deleted;
        }
        /*
         * =unshift
         */
        self.unshift= function(){
            var length = ArrayPrototype.unshift.apply(_array, arguments);
            noticeAllNew.call(this);
            return length;
        }
    }

    ObservableArrayPrototype.prototype  = ArrayPrototype;
    ObservableArray.prototype  = new ObservableArrayPrototype;

    function ArrayObserve(obj, prop, callback){
        obj[prop]   = new ObservableArray(obj[prop],callback);
    }

    window.ArrayObserve = ArrayObserve;
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
